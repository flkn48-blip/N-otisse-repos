// Petits pictogrammes pour le menu du Studio (sans dépendance externe).
const pictogramme = (signe: string) => {
  const Icone = () => <span style={{fontSize: '1.1em', lineHeight: 1}}>{signe}</span>
  return Icone
}

export const IconeEvenement = pictogramme('📅')
export const IconeActualite = pictogramme('📰')
export const IconePartenaire = pictogramme('🤝')
export const IconeAvis = pictogramme('💬')
export const IconeAvisPublie = pictogramme('✅')
export const IconeAvisRefuse = pictogramme('⛔')
