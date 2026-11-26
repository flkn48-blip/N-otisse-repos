// Fonction Netlify « espace » : serveur de l'espace Administration / Statistiques du site Néotisse.
// Tout passe par ici pour que les clés ne soient JAMAIS envoyées au navigateur.
//
// Variables à régler dans Netlify (Réglages du site > Environment variables) :
//   ESPACE_MOT_DE_PASSE   mot de passe commun des fondatrices pour entrer dans l'espace
//   ESPACE_SECRET         longue phrase aléatoire qui sert à signer la session (jamais communiquée)
//   SANITY_WRITE_TOKEN    déjà réglée (jeton « Editor » Sanity) : lire, publier, refuser, supprimer les avis
//   GA4_SERVICE_ACCOUNT   (statistiques réelles) contenu JSON de la clé du compte de service Google
//   GA4_PROPERTY_ID       (facultatif) numéro de la propriété GA4, 565838032 par défaut

import {createHmac, createHash, createSign, timingSafeEqual} from 'node:crypto'

export const config = {path: '/api/espace'}

const PROJET = process.env.SANITY_PROJECT_ID || 'uffj7vsg'
const DATASET = process.env.SANITY_DATASET || 'production'
const PROPRIETE_GA = process.env.GA4_PROPERTY_ID || '565838032'
const API_SANITY = '2025-02-19'
const COOKIE = 'nt_espace'
const DUREE_SESSION = 12 * 3600 // 12 h

const json = (status, corps, entetes = {}) =>
  new Response(JSON.stringify(corps), {
    status,
    headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...entetes},
  })

/* ------------------------------ Connexion ------------------------------ */

const sha = (t) => createHash('sha256').update(String(t)).digest()
const signer = (texte) => createHmac('sha256', process.env.ESPACE_SECRET || '').update(texte).digest('base64url')

function motDePasseJuste(saisi) {
  const attendu = process.env.ESPACE_MOT_DE_PASSE
  if (!attendu) return false
  return timingSafeEqual(sha(saisi), sha(attendu))
}

function creerCookie() {
  const exp = Math.floor(Date.now() / 1000) + DUREE_SESSION
  return `${COOKIE}=${exp}.${signer(String(exp))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DUREE_SESSION}`
}

const cookieVide = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`

function sessionValide(req) {
  if (!process.env.ESPACE_SECRET) return false
  const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  if (!m) return false
  const [exp, sig] = m[1].split('.')
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false
  const attendu = signer(exp)
  const a = Buffer.from(sig)
  const b = Buffer.from(attendu)
  return a.length === b.length && timingSafeEqual(a, b)
}

/* -------------------------------- Sanity ------------------------------- */

const jetonSanity = () => process.env.SANITY_WRITE_TOKEN

async function groq(requete) {
  const r = await fetch(
    `https://${PROJET}.api.sanity.io/v${API_SANITY}/data/query/${DATASET}?perspective=raw&query=${encodeURIComponent(requete)}`,
    {headers: {Authorization: `Bearer ${jetonSanity()}`}},
  )
  if (!r.ok) throw new Error('Sanity ' + r.status)
  return (await r.json()).result
}

async function muter(mutations) {
  const r = await fetch(`https://${PROJET}.api.sanity.io/v${API_SANITY}/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${jetonSanity()}`},
    body: JSON.stringify({mutations}),
  })
  if (!r.ok) throw new Error('Sanity ' + r.status)
}

const CHAMPS_AVIS = ['prenom', 'note', 'message', 'profil', 'sujet', 'envoyeLe']
const base = (id) => String(id).replace(/^drafts\./, '')

async function listerAvis() {
  const docs = await groq(
    '*[_type=="avis"]{_id,prenom,note,message,profil,sujet,envoyeLe,refuse}|order(envoyeLe desc)',
  )
  const parId = new Map()
  for (const d of docs) {
    const b = base(d._id)
    const e = parId.get(b) || {}
    if (d._id.startsWith('drafts.')) e.brouillon = d
    else e.publie = d
    parId.set(b, e)
  }
  const avis = []
  for (const [id, e] of parId) {
    const d = e.publie || e.brouillon
    let statut = 'attente'
    if (e.publie) statut = 'publie'
    else if (e.brouillon && e.brouillon.refuse) statut = 'refuse'
    avis.push({id, statut, prenom: d.prenom || '', note: d.note || 0, message: d.message || '', profil: d.profil || '', sujet: d.sujet || '', envoyeLe: d.envoyeLe || ''})
  }
  avis.sort((a, b) => String(b.envoyeLe).localeCompare(String(a.envoyeLe)))
  return avis
}

async function actionAvis(idBrut, op) {
  if (!/^[A-Za-z0-9_.-]{6,80}$/.test(String(idBrut))) throw Object.assign(new Error('Identifiant invalide.'), {status: 400})
  const id = base(idBrut)
  const brouillon = 'drafts.' + id
  const docs = await groq(`*[_type=="avis" && _id in ["${id}","${brouillon}"]]{_id,prenom,note,message,profil,sujet,envoyeLe,refuse}`)
  const pub = docs.find((d) => d._id === id)
  const bro = docs.find((d) => d._id === brouillon)
  const source = pub || bro
  if (!source) throw Object.assign(new Error('Avis introuvable.'), {status: 404})
  const champs = {}
  for (const c of CHAMPS_AVIS) if (source[c] !== undefined && source[c] !== null) champs[c] = source[c]

  if (op === 'publier') {
    await muter([{createOrReplace: {_id: id, _type: 'avis', ...champs, refuse: false}}, {delete: {id: brouillon}}])
  } else if (op === 'masquer') {
    // retire du site, remet en attente (brouillon privé)
    await muter([{createOrReplace: {_id: brouillon, _type: 'avis', ...champs, refuse: false}}, {delete: {id}}])
  } else if (op === 'refuser') {
    if (pub) throw Object.assign(new Error('Masquez d’abord cet avis avant de le refuser.'), {status: 400})
    await muter([{createOrReplace: {_id: brouillon, _type: 'avis', ...champs, refuse: true}}])
  } else if (op === 'remettre') {
    await muter([{createOrReplace: {_id: brouillon, _type: 'avis', ...champs, refuse: false}}])
  } else if (op === 'supprimer') {
    await muter([{delete: {id}}, {delete: {id: brouillon}}])
  } else {
    throw Object.assign(new Error('Action inconnue.'), {status: 400})
  }
}

/* ---------------------------- Google Analytics ------------------------- */

let jetonGa = null // {valeur, expire}

function compteService() {
  let brut = process.env.GA4_SERVICE_ACCOUNT
  if (!brut) return null
  brut = brut.trim()
  if (!brut.startsWith('{')) brut = Buffer.from(brut, 'base64').toString('utf8')
  return JSON.parse(brut)
}

async function obtenirJetonGa() {
  if (jetonGa && jetonGa.expire > Date.now() + 60000) return jetonGa.valeur
  const sa = compteService()
  const maintenant = Math.floor(Date.now() / 1000)
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const corps = enc({alg: 'RS256', typ: 'JWT'}) + '.' + enc({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: maintenant,
    exp: maintenant + 3600,
  })
  const signature = createSign('RSA-SHA256').update(corps).sign(sa.private_key, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: corps + '.' + signature}),
  })
  if (!r.ok) throw new Error('Google (connexion) ' + r.status)
  const j = await r.json()
  jetonGa = {valeur: j.access_token, expire: Date.now() + (j.expires_in || 3600) * 1000}
  return jetonGa.valeur
}

async function appelGa(chemin, corps) {
  const jeton = await obtenirJetonGa()
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPRIETE_GA}:${chemin}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${jeton}`},
    body: JSON.stringify(corps),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error('Google Analytics ' + r.status + ' ' + t.slice(0, 160))
  }
  return r.json()
}

const EVENEMENTS = ['generate_lead', 'click_demande_atelier', 'envoi_avis', 'click_contact', 'click_evenement']
const CANAUX = {
  'Organic Search': 'Recherche Google',
  'Organic Social': 'Réseaux sociaux',
  Direct: 'Accès direct',
  Referral: 'Autres sites',
  'Paid Search': 'Publicité',
  Email: 'E-mail',
  Unassigned: 'Non défini',
}

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`

function bornesMois(mois) {
  const [a, m] = mois.split('-').map(Number)
  const debut = new Date(Date.UTC(a, m - 1, 1))
  const fin = new Date(Date.UTC(a, m, 0))
  const aujourdhui = new Date()
  const finEffective = fin > aujourdhui ? aujourdhui : fin
  return {debut: iso(debut), fin: iso(finEffective), jours: fin.getUTCDate()}
}

const valeurs = (rapport) => (rapport.rows || []).map((l) => ({d: (l.dimensionValues || []).map((x) => x.value), m: (l.metricValues || []).map((x) => Number(x.value))}))

async function totauxMois(debut, fin) {
  const [sessions, evenements] = await Promise.all([
    appelGa('runReport', {dateRanges: [{startDate: debut, endDate: fin}], metrics: [{name: 'sessions'}]}),
    appelGa('runReport', {
      dateRanges: [{startDate: debut, endDate: fin}],
      dimensions: [{name: 'eventName'}],
      metrics: [{name: 'eventCount'}],
      dimensionFilter: {filter: {fieldName: 'eventName', inListFilter: {values: EVENEMENTS}}},
    }),
  ])
  const ev = {}
  for (const l of valeurs(evenements)) ev[l.d[0]] = l.m[0]
  const s = valeurs(sessions)
  return {visites: s.length ? s[0].m[0] : 0, demandes: ev.generate_lead || 0, clics: ev.click_demande_atelier || 0, avis: ev.envoi_avis || 0, contact: ev.click_contact || 0, evenements: ev.click_evenement || 0}
}

async function statistiques(mois) {
  if (!process.env.GA4_SERVICE_ACCOUNT) return {configure: false}
  const {debut, fin, jours} = bornesMois(mois)
  const precedent = new Date(Date.UTC(Number(mois.slice(0, 4)), Number(mois.slice(5, 7)) - 2, 1))
  const moisPrec = `${precedent.getUTCFullYear()}-${pad(precedent.getUTCMonth() + 1)}`
  const bp = bornesMois(moisPrec)

  const [lot, prec, temps] = await Promise.all([
    appelGa('batchRunReports', {
      requests: [
        {dateRanges: [{startDate: debut, endDate: fin}], dimensions: [{name: 'date'}], metrics: [{name: 'sessions'}], orderBys: [{dimension: {dimensionName: 'date'}}]},
        {dateRanges: [{startDate: debut, endDate: fin}], dimensions: [{name: 'sessionDefaultChannelGroup'}], metrics: [{name: 'sessions'}], orderBys: [{metric: {metricName: 'sessions'}, desc: true}]},
        {dateRanges: [{startDate: debut, endDate: fin}], dimensions: [{name: 'pagePath'}], metrics: [{name: 'screenPageViews'}], orderBys: [{metric: {metricName: 'screenPageViews'}, desc: true}], limit: 8},
        {
          dateRanges: [{startDate: debut, endDate: fin}],
          dimensions: [{name: 'eventName'}],
          metrics: [{name: 'eventCount'}],
          dimensionFilter: {filter: {fieldName: 'eventName', inListFilter: {values: EVENEMENTS}}},
        },
        {dateRanges: [{startDate: debut, endDate: fin}], metrics: [{name: 'sessions'}, {name: 'activeUsers'}]},
      ],
    }),
    totauxMois(bp.debut, bp.fin),
    appelGa('runRealtimeReport', {metrics: [{name: 'activeUsers'}]}),
  ])

  const [rJours, rCanaux, rPages, rEvents, rTotal] = lot.reports
  const parJour = new Map(valeurs(rJours).map((l) => [l.d[0], l.m[0]]))
  const serie = []
  const [a, m] = mois.split('-').map(Number)
  const nbJours = Math.min(jours, Number(fin.slice(8)))
  for (let j = 1; j <= nbJours; j++) {
    const cle = `${a}${pad(m)}${pad(j)}`
    serie.push(parJour.get(cle) || 0)
  }
  const ev = {}
  for (const l of valeurs(rEvents)) ev[l.d[0]] = l.m[0]
  const total = valeurs(rTotal)
  const tempsReel = valeurs(temps)

  return {
    configure: true,
    mois,
    jours: serie,
    sources: valeurs(rCanaux).map((l) => ({n: CANAUX[l.d[0]] || l.d[0], v: l.m[0]})),
    pages: valeurs(rPages).map((l) => ({n: l.d[0] === '/' ? 'Accueil' : l.d[0], v: l.m[0]})),
    kpi: {visites: total.length ? total[0].m[0] : 0, demandes: ev.generate_lead || 0, clics: ev.click_demande_atelier || 0, avis: ev.envoi_avis || 0, contact: ev.click_contact || 0, evenements: ev.click_evenement || 0},
    precedent: prec,
    tempsReel: tempsReel.length ? tempsReel[0].m[0] : 0,
    maj: new Date().toISOString(),
  }
}

/* ------------------------------- Routage ------------------------------- */

export default async (req) => {
  const url = new URL(req.url)
  const action = url.searchParams.get('action') || ''

  // Protection contre les requêtes venues d'un autre site
  if (req.method === 'POST' && req.headers.get('x-espace') !== '1') return json(403, {ok: false, message: 'Requête refusée.'})

  if (action === 'session') return json(200, {connecte: sessionValide(req)})

  if (action === 'connexion' && req.method === 'POST') {
    if (!process.env.ESPACE_MOT_DE_PASSE || !process.env.ESPACE_SECRET)
      return json(503, {ok: false, message: 'L’espace n’est pas encore configuré (mot de passe manquant dans Netlify).'})
    let d = {}
    try {
      d = await req.json()
    } catch {}
    if (!motDePasseJuste(d.motDePasse || '')) {
      await new Promise((r) => setTimeout(r, 1200)) // freine les essais en série
      return json(401, {ok: false, message: 'Mot de passe incorrect.'})
    }
    return json(200, {ok: true}, {'Set-Cookie': creerCookie()})
  }

  if (action === 'deconnexion' && req.method === 'POST') return json(200, {ok: true}, {'Set-Cookie': cookieVide()})

  // Tout ce qui suit demande d'être connecté
  if (!sessionValide(req)) return json(401, {ok: false, message: 'Session expirée. Merci de vous reconnecter.'})

  try {
    if (action === 'avis' && req.method === 'GET') {
      if (!jetonSanity()) return json(503, {ok: false, message: 'Le livre d’or n’est pas encore relié à Sanity.'})
      return json(200, {ok: true, avis: await listerAvis()})
    }
    if (action === 'avis-action' && req.method === 'POST') {
      if (!jetonSanity()) return json(503, {ok: false, message: 'Le livre d’or n’est pas encore relié à Sanity.'})
      const d = await req.json()
      await actionAvis(d.id, d.op)
      return json(200, {ok: true})
    }
    if (action === 'stats' && req.method === 'GET') {
      const mois = url.searchParams.get('mois') || ''
      if (!/^20\d\d-(0[1-9]|1[0-2])$/.test(mois)) return json(400, {ok: false, message: 'Mois invalide.'})
      return json(200, {ok: true, ...(await statistiques(mois))})
    }
  } catch (e) {
    return json(e.status || 502, {ok: false, message: e.status ? e.message : 'Le service est momentanément indisponible. Réessayez dans un instant.', detail: e.status ? undefined : String(e.message).slice(0, 200)})
  }
  return json(404, {ok: false, message: 'Action inconnue.'})
}
