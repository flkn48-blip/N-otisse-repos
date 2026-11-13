// Fonction Netlify « avis » : reçoit un avis envoyé depuis le livre d'or et le crée dans Sanity
// EN BROUILLON (identifiant « drafts.… »). Un brouillon n'est jamais lisible publiquement :
// seules les personnes connectées au Studio le voient. Une fondatrice le publie d'un clic (bouton « Publier »)
// ou le marque « Refusé » (il reste alors privé, en brouillon, pour garder une trace).
//
// La clé d'écriture Sanity n'est jamais envoyée au navigateur : elle se règle dans Netlify,
// Réglages du site > Environment variables > SANITY_WRITE_TOKEN (jeton « Editor » créé sur sanity.io/manage).

const PROJET = process.env.SANITY_PROJECT_ID || 'uffj7vsg'
const DATASET = process.env.SANITY_DATASET || 'production'

const PROFILS = ['Particulier', 'Établissement scolaire', 'Musée ou institution', 'Collectivité', 'Association', 'Chercheur ou chercheuse', 'Autre']
const SUJETS = ['Atelier démonstratif', 'Atelier participatif', 'Atelier enfant', 'Expérimentation', 'Conférence', 'Festival ou événement', 'Autre']

const reponse = (status, corps) =>
  new Response(JSON.stringify(corps), {status, headers: {'Content-Type': 'application/json; charset=utf-8'}})

export default async (req) => {
  if (req.method !== 'POST') return reponse(405, {ok: false, message: 'Méthode non autorisée.'})
  const jeton = process.env.SANITY_WRITE_TOKEN
  if (!jeton) return reponse(500, {ok: false, message: 'Le livre d’or n’est pas encore relié à Sanity.'})

  let d
  try {
    d = await req.json()
  } catch {
    return reponse(400, {ok: false, message: 'Demande illisible.'})
  }

  // Champ piège invisible : rempli seulement par les robots
  if (d.site) return reponse(200, {ok: true})

  const prenom = String(d.prenom || '').trim().slice(0, 60)
  const message = String(d.message || '').trim()
  const note = parseInt(d.note, 10)
  if (prenom.length < 2) return reponse(400, {ok: false, message: 'Merci d’indiquer votre prénom.'})
  if (!(note >= 1 && note <= 5)) return reponse(400, {ok: false, message: 'Merci de choisir une note.'})
  if (message.length < 10) return reponse(400, {ok: false, message: 'Merci d’écrire quelques mots pour votre avis.'})
  if (message.length > 800) return reponse(400, {ok: false, message: 'Votre message est trop long (800 caractères maximum).'})
  if (/https?:\/\/|www\./i.test(prenom + ' ' + message)) return reponse(400, {ok: false, message: 'Les liens ne sont pas acceptés dans un avis.'})

  const avis = {
    _id: 'drafts.' + crypto.randomUUID(),
    _type: 'avis',
    prenom,
    note,
    message,
    envoyeLe: new Date().toISOString(),
  }
  if (PROFILS.includes(d.profil)) avis.profil = d.profil
  if (SUJETS.includes(d.sujet)) avis.sujet = d.sujet

  const r = await fetch(`https://${PROJET}.api.sanity.io/v2025-02-19/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${jeton}`},
    body: JSON.stringify({mutations: [{create: avis}]}),
  })
  if (!r.ok) return reponse(502, {ok: false, message: 'L’avis n’a pas pu être enregistré. Merci de réessayer plus tard.'})
  return reponse(200, {ok: true})
}
