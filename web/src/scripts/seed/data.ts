/**
 * Contenu initial, tiré exclusivement de docs/contenu-source.md.
 * Traduction anglaise : rédigée par nous (à relire par la fondation).
 * Microcopie d'interface (boutons, introductions de pages) : rédigée par nous, signalée au client.
 */
import { richT, t, type L } from './helpers'

export type Status = 'published' | 'draft'
export type Ref = { __ref: [collection: string, key: string] }
export const ref = (collection: string, key: string): Ref => ({ __ref: [collection, key] })

export type SeedDoc = {
  key: string
  status: Status
  /** Slug par langue (identifiant stable du seed : slug FR). */
  slug: L
  data: Record<string, unknown>
}

/* ------------------------------------------------------------------ Médias */

export const MEDIA = [
  {
    key: 'hopital-1',
    file: 'hopital-1.png',
    alt: t(
      'Façade d’un bâtiment de l’hôpital où sont réparées les fistules, panneaux solaires sur le toit',
      'Front of a building at the hospital where fistula repairs take place, with solar panels on the roof',
    ),
  },
  {
    key: 'hopital-2',
    file: 'hopital-2.png',
    alt: t(
      'Pavillon de santé sexuelle et reproductive adaptée aux adolescents et aux jeunes',
      'Building dedicated to adolescent- and youth-friendly sexual and reproductive health',
    ),
  },
  {
    key: 'hopital-3',
    file: 'hopital-3.png',
    alt: t(
      'Cour de l’hôpital bordée de pavillons et de galeries couvertes',
      'Hospital courtyard lined with buildings and covered walkways',
    ),
  },
  {
    key: 'hopital-4',
    file: 'hopital-4.png',
    alt: t(
      'Pavillons jaunes de l’hôpital et réservoirs d’eau bleus',
      'Yellow hospital buildings and blue water tanks',
    ),
  },
  {
    key: 'hopital-5',
    file: 'hopital-5.png',
    alt: t(
      'Allée entre les pavillons de l’hôpital, avec un réservoir d’eau',
      'Path between hospital buildings, with a water tank',
    ),
  },
] as const

/* ------------------------------------------------------------ Partenaires */

export const PARTNERS: SeedDoc[] = [
  {
    key: 'coquis',
    status: 'published',
    slug: t('coquis-grand-kasai', 'coquis-grand-kasai'),
    data: { name: 'COQUIS des députés de l’espace Grand Kasaï', type: 'funder', order: 1 },
  },
  {
    key: 'ppcd',
    status: 'published',
    slug: t('ppcd', 'ppcd'),
    data: { name: 'PPCD', type: 'funder', order: 2 },
  },
  {
    key: 'innovation-genes',
    status: 'published',
    slug: t('innovation-genes', 'innovation-genes'),
    data: { name: 'Innovation Gènes', type: 'partner', order: 3 },
  },
  {
    key: 'massa',
    status: 'published',
    slug: t('hopital-de-reference-massa', 'massa-referral-hospital'),
    data: { name: 'Hôpital de référence Massa (Kasangulu)', type: 'hospital', order: 4 },
  },
  {
    key: 'ime-kimpese',
    status: 'published',
    slug: t('ime-kimpese', 'ime-kimpese'),
    data: { name: 'IME Kimpese', type: 'hospital', order: 5 },
  },
  // Non publiés : partenariat en négociation, ou liés à des réalisations hors périmètre v1.
  {
    key: 'fistula-foundation',
    status: 'draft',
    slug: t('fistula-foundation', 'fistula-foundation'),
    data: {
      name: 'Fistula Foundation',
      type: 'funder',
      order: 20,
      description: t(
        'Partenariat en négociation : ne pas publier.',
        'Partnership under negotiation: do not publish.',
      ),
    },
  },
  {
    key: 'bad',
    status: 'draft',
    slug: t('bad', 'afdb'),
    data: { name: 'BAD (Banque africaine de développement)', type: 'funder', order: 21 },
  },
  {
    key: 'ima',
    status: 'draft',
    slug: t('ima-world-health', 'ima-world-health'),
    data: { name: 'IMA World Health', type: 'funder', order: 22 },
  },
  {
    key: 'ue',
    status: 'draft',
    slug: t('union-europeenne-rdc', 'european-union-drc'),
    data: { name: 'Union européenne en RDC', type: 'funder', order: 23 },
  },
  {
    key: 'etoile-brulante',
    status: 'draft',
    slug: t('etoile-brulante', 'etoile-brulante'),
    data: { name: 'Étoile Brûlante', type: 'partner', order: 24 },
  },
]

/* ----------------------------------------------------------------- Équipe */

const surgeryRole = t('Chirurgie des fistules obstétricales', 'Obstetric fistula surgery')
const surgeryBio = t(
  'Opère les fistules vésico-vaginales et recto-vaginales.',
  'Repairs vesico-vaginal and recto-vaginal fistulas.',
)

export const TEAM: SeedDoc[] = [
  {
    key: 'kabongo',
    status: 'published',
    slug: t('gires-kabongo-kayiko', 'gires-kabongo-kayiko'),
    data: {
      name: 'Gires KABONGO KAYIKO',
      role: t('Président du Comité Exécutif', 'Chair of the Executive Committee'),
      group: 'direction',
      order: 1,
    },
  },
  {
    key: 'ntumba',
    status: 'published',
    slug: t('esther-ntumba-ngomba', 'esther-ntumba-ngomba'),
    data: {
      name: 'Esther NTUMBA NGOMBA',
      role: t('Secrétaire Générale', 'Secretary General'),
      group: 'direction',
      order: 2,
    },
  },
  {
    key: 'kapinga',
    status: 'published',
    slug: t('ruth-kapinga', 'ruth-kapinga'),
    data: {
      name: 'Ruth KAPINGA',
      role: t('Trésorière Générale', 'Treasurer General'),
      group: 'direction',
      order: 3,
    },
  },
  {
    key: 'leon',
    status: 'published',
    slug: t('leon-mubikayi-mubalamate', 'leon-mubikayi-mubalamate'),
    data: {
      name: 'Dr Léon MUBIKAYI MUBALAMATE',
      role: surgeryRole,
      group: 'surgeons',
      order: 1,
      bio: surgeryBio,
      training: t('Heal Africa, Goma (2006)', 'Heal Africa, Goma (2006)'),
      experience: t(
        'Plus de 1 000 cas opérés ; coordonne les campagnes',
        'More than 1,000 cases operated; coordinates the campaigns',
      ),
    },
  },
  {
    key: 'dolores',
    status: 'published',
    slug: t('dolores-nembunzu-mudadra', 'dolores-nembunzu-mudadra'),
    data: {
      name: 'Dr Dolorès NEMBUNZU MUDADRA',
      role: surgeryRole,
      group: 'surgeons',
      order: 2,
      bio: surgeryBio,
      training: t(
        'UNFPA/CRACE, Kinshasa/Nairobi (2007–2008)',
        'UNFPA/CRACE, Kinshasa/Nairobi (2007–2008)',
      ),
      experience: t('Plus de 1 000 cas opérés', 'More than 1,000 cases operated'),
    },
  },
  {
    key: 'ange',
    status: 'published',
    slug: t('ange-mukuliboy-muley', 'ange-mukuliboy-muley'),
    data: {
      name: 'Dr Ange MUKULIBOY MULEY',
      role: surgeryRole,
      group: 'surgeons',
      order: 3,
      bio: surgeryBio,
      training: t('UNFPA, Kinshasa (2023)', 'UNFPA, Kinshasa (2023)'),
      experience: t('Environ 300 cas opérés', 'About 300 cases operated'),
    },
  },
  {
    key: 'kambale',
    status: 'published',
    slug: t('benjamin-kambale', 'benjamin-kambale'),
    data: {
      name: 'Dr Benjamin KAMBALE',
      role: surgeryRole,
      group: 'surgeons',
      order: 4,
      bio: surgeryBio,
      training: t('FIGO, Éthiopie', 'FIGO, Ethiopia'),
    },
  },
]

/* --------------------------------------------------------------- Secteurs */

export const SECTORS: SeedDoc[] = [
  {
    key: 'sante',
    status: 'published',
    slug: t('sante', 'health'),
    data: {
      title: t(
        'Santé maternelle et fistules obstétricales',
        'Maternal health and obstetric fistula',
      ),
      tagline: t(
        'Améliorer la santé et le bien-être de la mère et de l’enfant, en particulier par la prise en charge des fistules obstétricales et la réduction des accouchements à risque.',
        'Improving the health and well-being of mothers and children, in particular by treating obstetric fistula and reducing high-risk deliveries.',
      ),
      icon: 'heart-pulse',
      order: 1,
      coverImage: ref('media', 'hopital-1'),
      description: richT(
        [
          [
            'p',
            'Notre mission : contribuer à l’amélioration de la santé et du bien-être de la mère et de l’enfant, en particulier par la prise en charge des fistules obstétricales et la réduction des accouchements à risque.',
          ],
          ['h', 'Nos axes d’intervention'],
          [
            'ul',
            [
              'Identifier activement les femmes vivant avec une fistule et assurer leur référence rapide vers des structures spécialisées.',
              'Assurer une prise en charge chirurgicale, médicale et psychosociale gratuite et complète : pré- et post-opératoire, soutien psychologique, réhabilitation.',
              'Sensibiliser les communautés par des campagnes d’information, d’éducation et de communication (IEC) : prévention et bonnes pratiques obstétricales.',
              'Renforcer les capacités du personnel de santé local : médecins, infirmiers, sages-femmes.',
              'Favoriser la réinsertion socio-économique des survivantes : formations, activités génératrices de revenus, inclusion sociale.',
            ],
          ],
          ['h', 'L’équipe'],
          [
            'p',
            'Nos quatre chirurgiens opèrent les fistules vésico-vaginales et recto-vaginales. L’équipe est complétée par 2 anesthésistes et 2 infirmiers formés au suivi pré- et post-opératoire.',
          ],
          [
            'p',
            'Contexte : plus de 900 décès maternels pour 100 000 naissances vivantes (source : DHIS2).',
          ],
        ],
        [
          [
            'p',
            'Our mission: to help improve the health and well-being of mothers and children, in particular by treating obstetric fistula and reducing high-risk deliveries.',
          ],
          ['h', 'What we do'],
          [
            'ul',
            [
              'Actively identify women living with fistula and refer them quickly to specialised facilities.',
              'Provide free, comprehensive surgical, medical and psychosocial care: before and after surgery, psychological support and rehabilitation.',
              'Raise community awareness through information, education and communication (IEC) campaigns on prevention and good obstetric practice.',
              'Build the skills of local health staff: doctors, nurses and midwives.',
              'Support the social and economic reintegration of survivors: training, income-generating activities and social inclusion.',
            ],
          ],
          ['h', 'The team'],
          [
            'p',
            'Our four surgeons repair vesico-vaginal and recto-vaginal fistulas. They are supported by 2 anaesthetists and 2 nurses trained in pre- and post-operative care.',
          ],
          ['p', 'Context: more than 900 maternal deaths per 100,000 live births (source: DHIS2).'],
        ],
      ),
      keyPoints: [
        {
          text: t(
            'Dépistage et référence des femmes vivant avec une fistule',
            'Screening and referral of women living with fistula',
          ),
        },
        {
          text: t(
            'Chirurgie et prise en charge gratuites et complètes',
            'Free, comprehensive surgery and care',
          ),
        },
        { text: t('Sensibilisation communautaire (IEC)', 'Community awareness (IEC)') },
        { text: t('Formation du personnel de santé local', 'Training for local health staff') },
        {
          text: t(
            'Réinsertion socio-économique des survivantes',
            'Social and economic reintegration of survivors',
          ),
        },
      ],
      figures: [
        {
          value: t('7 500+', '7,500+'),
          label: t(
            'femmes, familles et agents de santé sensibilisés',
            'women, families and health workers reached by awareness activities',
          ),
        },
        {
          value: t('250+', '250+'),
          label: t('patientes traitées (2022–2025)', 'patients treated (2022–2025)'),
        },
        { value: t('> 86 %', '> 86%'), label: t('de taux de succès', 'success rate') },
        {
          value: t('34', '34'),
          label: t(
            'cas opérés à Kasangulu (Hôpital de référence Massa) et à l’IME Kimpese',
            'cases operated in Kasangulu (Massa Referral Hospital) and at IME Kimpese',
          ),
        },
        {
          value: t('40', '40'),
          label: t(
            'cas en liste d’attente, faute de financement',
            'cases on the waiting list for lack of funding',
          ),
        },
        {
          value: t('≈ 50', '≈ 50'),
          label: t(
            'cas identifiés dans le territoire de Kasangulu en 2025',
            'cases identified in Kasangulu territory in 2025',
          ),
        },
      ],
      methodology: [
        {
          title: t('Sensibilisation communautaire', 'Community awareness'),
          text: t(
            'Identifier les femmes vivant avec une fistule et les orienter vers des structures spécialisées.',
            'Identify women living with fistula and refer them to specialised facilities.',
          ),
        },
        {
          title: t(
            'Confirmation et chirurgie à l’hôpital',
            'Diagnosis and surgery at the hospital',
          ),
          text: t(
            'Prise en charge chirurgicale, médicale et psychosociale gratuite.',
            'Free surgical, medical and psychosocial care.',
          ),
        },
        {
          title: t('Suivi post-opératoire', 'Post-operative follow-up'),
          text: t(
            'À l’hôpital, puis dans la communauté.',
            'At the hospital, then in the community.',
          ),
        },
        {
          title: t(
            'Réinsertion et lutte contre la stigmatisation',
            'Reintegration and fighting stigma',
          ),
          text: t(
            'Formations, activités génératrices de revenus et inclusion sociale des survivantes.',
            'Training, income-generating activities and social inclusion for survivors.',
          ),
        },
      ],
      callout: {
        title: t('Soutenir la prise en charge des fistules', 'Support fistula care'),
        text: t(
          'Aucun partenaire financier ne soutient actuellement ces interventions dans le Kongo Central. Le principal frein est le financement : 40 cas sont en liste d’attente.',
          'No funding partner currently supports this work in Kongo Central. Funding is the main obstacle: 40 cases are on the waiting list.',
        ),
      },
    },
  },
  {
    key: 'agriculture',
    status: 'published',
    slug: t('agriculture', 'agriculture'),
    data: {
      title: t('Agriculture', 'Agriculture'),
      tagline: t(
        'Production de fruits, de légumes et de cultures vivrières.',
        'Growing fruit, vegetables and staple food crops.',
      ),
      icon: 'sprout',
      order: 2,
      description: richT(
        [
          [
            'ul',
            [
              '**Fruits et légumes** : chou, melon, tomate, concombre, gombo.',
              '**Cultures vivrières** : manioc, maïs, soja.',
            ],
          ],
        ],
        [
          [
            'ul',
            [
              '**Fruit and vegetables**: cabbage, melon, tomato, cucumber, okra.',
              '**Staple food crops**: cassava, maize, soybeans.',
            ],
          ],
        ],
      ),
      keyPoints: [
        {
          text: t(
            'Fruits et légumes : chou, melon, tomate, concombre, gombo',
            'Fruit and vegetables: cabbage, melon, tomato, cucumber, okra',
          ),
        },
        {
          text: t(
            'Cultures vivrières : manioc, maïs, soja',
            'Staple crops: cassava, maize, soybeans',
          ),
        },
      ],
    },
  },
  {
    key: 'elevage',
    status: 'published',
    slug: t('elevage', 'livestock'),
    data: {
      title: t('Élevage', 'Livestock'),
      tagline: t('Élevage de porcs, de vaches et de moutons.', 'Raising pigs, cattle and sheep.'),
      icon: 'beef',
      order: 3,
      description: richT(
        [['p', 'Élevage de porcs, de vaches et de moutons.']],
        [['p', 'Raising pigs, cattle and sheep.']],
      ),
      keyPoints: [
        { text: t('Porcs', 'Pigs') },
        { text: t('Vaches', 'Cattle') },
        { text: t('Moutons', 'Sheep') },
      ],
    },
  },
  {
    key: 'peche',
    status: 'published',
    slug: t('peche-et-pisciculture', 'fishing-and-fish-farming'),
    data: {
      title: t('Pêche et pisciculture', 'Fishing and fish farming'),
      tagline: t('Pêche et élevage de poissons.', 'Fishing and raising fish.'),
      icon: 'fish',
      order: 4,
      description: richT(
        [['p', 'Pêche et élevage de poissons (pisciculture).']],
        [['p', 'Fishing and raising fish (fish farming).']],
      ),
      keyPoints: [
        { text: t('Pêche', 'Fishing') },
        { text: t('Élevage de poissons (pisciculture)', 'Fish farming') },
      ],
    },
  },
  {
    key: 'intrants',
    status: 'published',
    slug: t('intrants-piscicoles', 'fish-farming-inputs'),
    data: {
      title: t('Intrants piscicoles', 'Fish farming inputs'),
      tagline: t(
        'Aliments pour poissons de marques partenaires, équipements et intrants pour la pisciculture.',
        'Fish feed from partner brands, plus fish farming equipment and inputs.',
      ),
      icon: 'package',
      order: 5,
      description: richT(
        [
          [
            'ul',
            [
              'Commercialisation d’aliments pour poissons de marques partenaires.',
              'Équipements et intrants pour la pisciculture.',
            ],
          ],
        ],
        [
          [
            'ul',
            ['Sale of fish feed from partner brands.', 'Equipment and inputs for fish farming.'],
          ],
        ],
      ),
      keyPoints: [
        {
          text: t('Aliments pour poissons de marques partenaires', 'Fish feed from partner brands'),
        },
        { text: t('Équipements et intrants piscicoles', 'Fish farming equipment and inputs') },
      ],
    },
  },
]

/* ----------------------------------------------------------- Réalisations */

const health = ref('sectors', 'sante')
const usd = (value: number, display: boolean) => ({ value, currency: 'USD', display })
const cases = (count: number) => ({ count, unit: 'cases' })

export const PROJECTS: SeedDoc[] = [
  {
    key: 'tshibala',
    status: 'published',
    slug: t('fistules-hgr-tshibala', 'fistula-tshibala-general-hospital'),
    data: {
      title: t(
        'Sensibilisation et réparation des fistules — HGR Tshibala',
        'Fistula awareness and repair — Tshibala General Referral Hospital',
      ),
      summary: t(
        'Deux campagnes de sensibilisation et de réparation des fistules obstétricales, menées par le Dr Léon Mubikayi.',
        'Two obstetric fistula awareness and repair campaigns led by Dr Léon Mubikayi.',
      ),
      location: 'HGR Tshibala',
      provinces: ['kasai-central'],
      sector: health,
      funders: [ref('partners', 'coquis')],
      team: [ref('team', 'leon')],
      amount: usd(84600, true),
    },
  },
  {
    key: 'bonzola',
    status: 'published',
    slug: t('fistules-hgr-bonzola', 'fistula-bonzola-general-hospital'),
    data: {
      title: t(
        'Sensibilisation et réparation des fistules — HGR Bonzola',
        'Fistula awareness and repair — Bonzola General Referral Hospital',
      ),
      summary: t(
        'Sensibilisation et réparation des fistules de 38 femmes.',
        'Awareness activities and fistula repair for 38 women.',
      ),
      location: 'HGR Bonzola',
      provinces: ['kasai-oriental'],
      sector: health,
      funders: [ref('partners', 'coquis')],
      amount: usd(75350, true),
      beneficiaries: cases(38),
    },
  },
  {
    key: 'bakwa-mulumba',
    status: 'published',
    slug: t('fistules-saint-joseph-bakwa-mulumba', 'fistula-saint-joseph-bakwa-mulumba'),
    data: {
      title: t(
        'Sensibilisation et réparation des fistules — Hôpital Saint Joseph de Bakwa Mulumba',
        'Fistula awareness and repair — Saint Joseph Hospital, Bakwa Mulumba',
      ),
      summary: t(
        'Sensibilisation et réparation de 64 cas de fistules, avec le Dr Léon et le Dr Ange.',
        'Awareness activities and repair of 64 fistula cases, with Dr Léon and Dr Ange.',
      ),
      location: 'Hôpital Saint Joseph de Bakwa Mulumba',
      provinces: ['kasai-oriental'],
      sector: health,
      funders: [ref('partners', 'coquis')],
      team: [ref('team', 'leon'), ref('team', 'ange')],
      amount: usd(123970, true),
      beneficiaries: cases(64),
    },
  },
  {
    key: 'muya',
    status: 'published',
    slug: t('fistules-hgr-muya', 'fistula-muya-general-hospital'),
    data: {
      title: t(
        'Réparation des fistules et suivi post-opératoire — HGR Muya',
        'Fistula repair and post-operative follow-up — Muya General Referral Hospital',
      ),
      summary: t(
        'Réparation de 23 cas de fistules et suivi post-opératoire.',
        'Repair of 23 fistula cases and post-operative follow-up.',
      ),
      location: 'HGR Muya',
      provinces: ['kasai-oriental'],
      sector: health,
      funders: [ref('partners', 'coquis')],
      amount: usd(45800, true),
      beneficiaries: cases(23),
    },
  },
  {
    key: 'miabi-lodja',
    status: 'published',
    slug: t('fistules-miabi-lodja-wembo-nyama', 'fistula-miabi-lodja-wembo-nyama'),
    data: {
      title: t(
        'Campagnes de réparation des fistules — Miabi, Lodja et Wembo-Nyama',
        'Fistula repair campaigns — Miabi, Lodja and Wembo-Nyama',
      ),
      summary: t(
        'Deux campagnes de réparation des fistules : 153 cas pris en charge.',
        'Two fistula repair campaigns: 153 cases treated.',
      ),
      location: 'HR Miabi, Lodja, Wembo-Nyama',
      provinces: ['kasai-oriental', 'sankuru'],
      sector: health,
      funders: [ref('partners', 'coquis')],
      amount: usd(363550, true),
      beneficiaries: cases(153),
    },
  },
  {
    key: 'kasangulu',
    status: 'published',
    slug: t('fistules-obstetricales-kasangulu', 'obstetric-fistula-kasangulu'),
    data: {
      title: t('Fistules obstétricales — Kasangulu', 'Obstetric fistula — Kasangulu'),
      summary: t(
        '34 cas de fistules obstétricales opérés à l’Hôpital de référence Massa (Kasangulu) et à l’IME Kimpese (Songololo) par le Dr Léon, le Dr Ange et le Dr Dolorès.',
        '34 obstetric fistula cases operated at Massa Referral Hospital (Kasangulu) and IME Kimpese (Songololo) by Dr Léon, Dr Ange and Dr Dolorès.',
      ),
      location: 'HR Massa (Kasangulu) et IME Kimpese',
      provinces: ['kongo-central'],
      sector: health,
      featured: true,
      funders: [ref('partners', 'ppcd'), ref('partners', 'innovation-genes')],
      partners: [ref('partners', 'massa'), ref('partners', 'ime-kimpese')],
      team: [ref('team', 'leon'), ref('team', 'ange'), ref('team', 'dolores')],
      amount: usd(55550, true),
      beneficiaries: cases(34),
      coverImage: ref('media', 'hopital-1'),
    },
  },
  // Non publiés.
  {
    key: 'fistula-foundation',
    status: 'draft',
    slug: t('fistules-fistula-foundation', 'fistula-fistula-foundation'),
    data: {
      title: t(
        'Prise en charge des fistules — Fistula Foundation',
        'Fistula care — Fistula Foundation',
      ),
      summary: t(
        'Partenariat en négociation : ne pas publier.',
        'Partnership under negotiation: do not publish.',
      ),
      location: '[À FOURNIR : lieu]',
      sector: health,
      funders: [ref('partners', 'fistula-foundation')],
    },
  },
  {
    key: 'boma-tshela',
    status: 'draft',
    slug: t('infrastructures-boma-tshela', 'infrastructure-boma-tshela'),
    data: {
      title: t(
        'Infrastructures sanitaires et scolaires — Boma et Tshela',
        'Health and school infrastructure — Boma and Tshela',
      ),
      summary: t(
        'Infrastructures sanitaires et scolaires à Boma et Tshela (programme PROADER).',
        'Health and school infrastructure in Boma and Tshela (PROADER programme).',
      ),
      location: 'Boma et Tshela',
      provinces: ['kongo-central'],
      funders: [ref('partners', 'bad')],
      partners: [ref('partners', 'innovation-genes')],
      amount: usd(1375517, false),
    },
  },
  {
    key: 'kwango-kwilu',
    status: 'draft',
    slug: t('infrastructures-kwango-kwilu', 'infrastructure-kwango-kwilu'),
    data: {
      title: t(
        'Infrastructures scolaires et marché urbain — Kwango et Kwilu',
        'School infrastructure and urban market — Kwango and Kwilu',
      ),
      summary: t(
        'Infrastructures scolaires et marché urbain au Kwango et au Kwilu (programme PROADER).',
        'School infrastructure and an urban market in Kwango and Kwilu (PROADER programme).',
      ),
      location: 'Kwango et Kwilu',
      provinces: ['kwango', 'kwilu'],
      funders: [ref('partners', 'bad')],
      partners: [ref('partners', 'innovation-genes')],
      amount: usd(490465, false),
    },
  },
  {
    key: 'eau-kasai-oriental',
    status: 'draft',
    slug: t('eau-potable-kasai-oriental', 'drinking-water-kasai-oriental'),
    data: {
      title: t(
        'Eau potable en milieu rural — Kasaï Oriental',
        'Rural drinking water — Kasai Oriental',
      ),
      summary: t(
        'Accès à l’eau potable en milieu rural au Kasaï Oriental (programme PRISE).',
        'Access to drinking water in rural Kasai Oriental (PRISE programme).',
      ),
      location: 'Kasaï Oriental',
      provinces: ['kasai-oriental'],
      funders: [ref('partners', 'bad')],
      partners: [ref('partners', 'innovation-genes')],
      amount: usd(348525, false),
    },
  },
  {
    key: 'moustiquaires',
    status: 'draft',
    slug: t('moustiquaires-lualaba-tanganyika', 'bed-nets-lualaba-tanganyika'),
    data: {
      title: t(
        'Distribution de moustiquaires imprégnées — Lualaba et Tanganyika',
        'Insecticide-treated bed net distribution — Lualaba and Tanganyika',
      ),
      summary: t(
        'Distribution de moustiquaires imprégnées au Lualaba et au Tanganyika.',
        'Distribution of insecticide-treated bed nets in Lualaba and Tanganyika.',
      ),
      location: 'Lualaba et Tanganyika',
      provinces: ['lualaba', 'tanganyika'],
      funders: [ref('partners', 'ima')],
      partners: [ref('partners', 'innovation-genes')],
      amount: usd(118560, false),
    },
  },
  {
    key: 'kits-equateur',
    status: 'draft',
    slug: t('kits-scolaires-equateur', 'school-kits-equateur'),
    data: {
      title: t('Distribution de kits scolaires — Équateur', 'School kit distribution — Équateur'),
      summary: t(
        'Distribution de kits scolaires dans la province de l’Équateur.',
        'Distribution of school kits in Équateur province.',
      ),
      location: 'Équateur',
      provinces: ['equateur'],
      funders: [ref('partners', 'ue')],
      partners: [ref('partners', 'etoile-brulante')],
      amount: usd(78000, false),
    },
  },
]

/* --------------------------------------------- Catalogue : exemples en brouillon */

export const BRANDS: SeedDoc[] = [
  {
    key: 'marque-a',
    status: 'draft',
    slug: t('exemple-marque-a', 'example-brand-a'),
    data: {
      name: '[EXEMPLE] Marque A',
      description: t(
        'Fiche d’exemple, à remplacer par une marque partenaire réelle.',
        'Example entry, to be replaced with a real partner brand.',
      ),
    },
  },
  {
    key: 'marque-b',
    status: 'draft',
    slug: t('exemple-marque-b', 'example-brand-b'),
    data: {
      name: '[EXEMPLE] Marque B',
      description: t(
        'Fiche d’exemple, à remplacer par une marque partenaire réelle.',
        'Example entry, to be replaced with a real partner brand.',
      ),
    },
  },
]

const exampleSpecs = [
  { label: t('Caractéristique', 'Feature'), value: t('[À FOURNIR]', '[TO BE PROVIDED]') },
]
const exampleExcerpt = t(
  'Fiche d’exemple, à remplacer par un produit réel.',
  'Example entry, to be replaced with a real product.',
)

export const PRODUCTS: SeedDoc[] = [
  {
    key: 'aliment',
    status: 'draft',
    slug: t('exemple-aliment-flottant', 'example-floating-fish-feed'),
    data: {
      name: t('[EXEMPLE] Aliment flottant pour poissons', '[EXAMPLE] Floating fish feed'),
      brand: ref('brands', 'marque-a'),
      category: 'fish-feed',
      availability: 'available',
      excerpt: exampleExcerpt,
      specs: exampleSpecs,
    },
  },
  {
    key: 'aerateur',
    status: 'draft',
    slug: t('exemple-aerateur-de-bassin', 'example-pond-aerator'),
    data: {
      name: t('[EXEMPLE] Aérateur de bassin', '[EXAMPLE] Pond aerator'),
      brand: ref('brands', 'marque-b'),
      category: 'equipment',
      availability: 'on-order',
      excerpt: exampleExcerpt,
      specs: exampleSpecs,
    },
  },
  {
    key: 'alevins',
    status: 'draft',
    slug: t('exemple-alevins', 'example-fingerlings'),
    data: {
      name: t('[EXEMPLE] Alevins', '[EXAMPLE] Fingerlings'),
      category: 'inputs',
      availability: 'unavailable',
      excerpt: exampleExcerpt,
      specs: exampleSpecs,
    },
  },
]

/* ------------------------------------------------------------------ Pages */

const custom = (label: L, fr: string, en: string, style?: string) => ({
  link: { type: 'custom', label, url: t(fr, en), ...(style ? { style } : {}) },
})
const toPage = (label: L, key: string, style?: string) => ({
  link: {
    type: 'reference',
    label,
    reference: { relationTo: 'pages', value: ref('pages', key) },
    ...(style ? { style } : {}),
  },
})

const vocation = t(
  'ASBL congolaise à vocation nationale, la Fondation Stark Hold Solutions mène des actions d’urgence et de développement durable, et assiste les communautés et les populations vulnérables.',
  'A Congolese non-profit with a national remit, Fondation Stark Hold Solutions carries out emergency and sustainable development work and supports vulnerable communities and populations.',
)
const contactLabel = t('Nous contacter', 'Contact us')

export const PAGES: SeedDoc[] = [
  {
    key: 'contact',
    status: 'published',
    slug: t('contact', 'contact'),
    data: {
      title: t('Contact', 'Contact'),
      layout: [
        {
          blockType: 'hero',
          eyebrow: t('Contact', 'Contact'),
          title: contactLabel,
          text: t(
            'Une question, un projet de partenariat ou une demande de devis ? Écrivez-nous ou appelez-nous.',
            'A question, a partnership idea or a quote request? Write to us or give us a call.',
          ),
        },
        {
          blockType: 'content',
          heading: t('Coordonnées', 'Contact details'),
          content: richT(
            [
              [
                'p',
                '**Siège** : N° 70, Av. de la Gombe, Q. Batetela, Commune de la Gombe, Kinshasa, RD Congo',
              ],
              [
                'p',
                '**Antenne** : Kasangulu, Kongo Central (bâtiment administratif du territoire de Kasangulu)',
              ],
              ['p', '**Téléphone et WhatsApp** : +243 904 947 476'],
              ['p', '**E-mail** : contact@fondationstarkhold.org'],
            ],
            [
              [
                'p',
                '**Head office**: No. 70, Avenue de la Gombe, Batetela district, Gombe commune, Kinshasa, DR Congo',
              ],
              [
                'p',
                '**Branch office**: Kasangulu, Kongo Central (Kasangulu territory administrative building)',
              ],
              ['p', '**Phone and WhatsApp**: +243 904 947 476'],
              ['p', '**Email**: contact@fondationstarkhold.org'],
            ],
          ),
        },
      ],
    },
  },
  {
    key: 'a-propos',
    status: 'published',
    slug: t('a-propos', 'about'),
    data: {
      title: t('À propos', 'About us'),
      layout: [
        {
          blockType: 'hero',
          eyebrow: t('À propos', 'About us'),
          title: t('Fondation Stark Hold Solutions', 'Fondation Stark Hold Solutions'),
          text: vocation,
          image: ref('media', 'hopital-3'),
        },
        {
          blockType: 'content',
          heading: t('Notre mission', 'Our mission'),
          content: richT(
            [
              [
                'p',
                'La Fondation Stark Hold Solutions (FSHS) est une association sans but lucratif (ASBL) congolaise à vocation nationale. Elle mène des actions d’urgence et de développement durable, et assiste les communautés et les populations vulnérables.',
              ],
              ['h', 'Statut légal'],
              [
                'p',
                'Association sans but lucratif dotée de la personnalité juridique par l’Arrêté n°119/CAB/MIN/J/022.',
              ],
              ['h', 'Où nous trouver'],
              [
                'ul',
                [
                  '**Siège** : N° 70, Av. de la Gombe, Q. Batetela, Commune de la Gombe, Kinshasa, RD Congo.',
                  '**Antenne** : Kasangulu, Kongo Central (bâtiment administratif du territoire de Kasangulu).',
                ],
              ],
              ['h', 'Zones d’intervention'],
              [
                'p',
                'Kwango, Kwilu, Maï-Ndombe, Sankuru, Kasaï, Kasaï Central, Kasaï Oriental, Lualaba, Tshopo et Kongo Central.',
              ],
            ],
            [
              [
                'p',
                'Fondation Stark Hold Solutions (FSHS) is a Congolese non-profit association (ASBL) with a national remit. It carries out emergency and sustainable development work and supports vulnerable communities and populations.',
              ],
              ['h', 'Legal status'],
              [
                'p',
                'Non-profit association granted legal personality by Order No. 119/CAB/MIN/J/022.',
              ],
              ['h', 'Where to find us'],
              [
                'ul',
                [
                  '**Head office**: No. 70, Avenue de la Gombe, Batetela district, Gombe commune, Kinshasa, DR Congo.',
                  '**Branch office**: Kasangulu, Kongo Central (Kasangulu territory administrative building).',
                ],
              ],
              ['h', 'Where we work'],
              [
                'p',
                'Kwango, Kwilu, Mai-Ndombe, Sankuru, Kasai, Kasai Central, Kasai Oriental, Lualaba, Tshopo and Kongo Central.',
              ],
            ],
          ),
        },
        {
          blockType: 'keyFigures',
          eyebrow: t('Nos équipes', 'Our people'),
          heading: t('29 personnes engagées', '29 committed people'),
          items: [
            {
              value: t('12', '12'),
              label: t(
                'en santé, dont 4 chirurgiens des fistules',
                'in health, including 4 fistula surgeons',
              ),
            },
            {
              value: t('8', '8'),
              label: t('en agriculture et environnement', 'in agriculture and environment'),
            },
            { value: t('2', '2'), label: t('en pêche et élevage', 'in fishing and livestock') },
            { value: t('3', '3'), label: t('à la direction', 'in leadership') },
            { value: t('4', '4'), label: t('à l’administration', 'in administration') },
          ],
        },
        {
          blockType: 'team',
          eyebrow: t('Gouvernance', 'Governance'),
          heading: t('Direction', 'Leadership'),
          groups: ['direction'],
        },
        {
          blockType: 'team',
          eyebrow: t('Santé', 'Health'),
          heading: t('Équipe chirurgicale', 'Surgical team'),
          groups: ['surgeons'],
        },
        {
          blockType: 'partners',
          eyebrow: t('Ils financent ou accueillent nos actions', 'Funding and host partners'),
          heading: t('Nos partenaires', 'Our partners'),
        },
      ],
    },
  },
  {
    key: 'accueil',
    status: 'published',
    slug: t('accueil', 'home'),
    data: {
      title: t('Accueil', 'Home'),
      layout: [
        {
          blockType: 'hero',
          eyebrow: t('Fondation Stark Hold Solutions', 'Fondation Stark Hold Solutions'),
          title: t('Aller plus loin ensemble', 'Go further together'),
          text: vocation,
          image: ref('media', 'hopital-1'),
          links: [
            custom(
              t('Découvrir nos secteurs', 'Explore our sectors'),
              '/secteurs',
              '/sectors',
              'primary',
            ),
            toPage(contactLabel, 'contact', 'outline'),
          ],
        },
        {
          blockType: 'keyFigures',
          eyebrow: t('Santé maternelle', 'Maternal health'),
          heading: t(
            'Nos résultats contre les fistules obstétricales',
            'Our results against obstetric fistula',
          ),
          items: [
            {
              value: t('7 500+', '7,500+'),
              label: t('personnes sensibilisées', 'people reached by awareness activities'),
            },
            {
              value: t('250+', '250+'),
              label: t('patientes traitées (2022–2025)', 'patients treated (2022–2025)'),
            },
            { value: t('> 86 %', '> 86%'), label: t('de taux de succès', 'success rate') },
            {
              value: t('40', '40'),
              label: t(
                'cas en liste d’attente, faute de financement',
                'cases waiting for lack of funding',
              ),
            },
          ],
        },
        {
          blockType: 'sectorsGrid',
          eyebrow: t('Nos secteurs', 'Our sectors'),
          heading: t('Là où nous agissons', 'Where we work'),
        },
        {
          blockType: 'projectsGrid',
          eyebrow: t('Réalisations', 'Our work'),
          heading: t('Nos interventions en santé', 'Our health interventions'),
          sector: health,
          limit: 6,
          links: [
            custom(
              t('Toutes les réalisations', 'All our work'),
              '/realisations',
              '/projects',
              'outline',
            ),
          ],
        },
        {
          blockType: 'partners',
          eyebrow: t('Partenaires', 'Partners'),
          heading: t('Ils financent ou accueillent nos actions', 'They fund or host our work'),
        },
        {
          blockType: 'cta',
          heading: t('Soutenir la prise en charge des fistules', 'Support fistula care'),
          text: t(
            '40 cas sont en liste d’attente, faute de financement. Parlons-en.',
            '40 cases are on the waiting list for lack of funding. Let’s talk.',
          ),
          tone: 'dark',
          links: [toPage(contactLabel, 'contact', 'primary')],
        },
      ],
    },
  },
]

/* ---------------------------------------------------------------- Globals */

export const SITE_SETTINGS = {
  name: 'Fondation Stark Hold Solutions',
  shortName: 'FSHS',
  tagline: t('Aller plus loin ensemble', 'Go further together'),
  legalStatus: t(
    'Association sans but lucratif (ASBL) — personnalité juridique : Arrêté n°119/CAB/MIN/J/022',
    'Non-profit association (ASBL) — legal personality: Order No. 119/CAB/MIN/J/022',
  ),
  homePage: ref('pages', 'accueil'),
  interventionZones: [
    'kwango',
    'kwilu',
    'mai-ndombe',
    'sankuru',
    'kasai',
    'kasai-central',
    'kasai-oriental',
    'lualaba',
    'tshopo',
    'kongo-central',
  ],
  phone: '+243 904 947 476',
  email: 'contact@fondationstarkhold.org',
  headOffice: t(
    'N° 70, Av. de la Gombe, Q. Batetela, Commune de la Gombe, Kinshasa, RD Congo',
    'No. 70, Avenue de la Gombe, Batetela district, Gombe commune, Kinshasa, DR Congo',
  ),
  branchOffice: t(
    'Kasangulu, Kongo Central (bâtiment administratif du territoire de Kasangulu)',
    'Kasangulu, Kongo Central (Kasangulu territory administrative building)',
  ),
  whatsappNumber: '243904947476',
  // Messages repris de la page de lancement (validée).
  whatsappMessage: t(
    'Bonjour, je souhaite avoir des informations sur la Fondation Stark Hold Solutions.',
    'Hello, I would like to know more about Fondation Stark Hold Solutions.',
  ),
  xUrl: null,
  linkedinUrl: null,
  facebookUrl: null,
}

const navCustom = (label: L, fr: string, en: string) => ({
  link: { type: 'custom', label, url: t(fr, en) },
})
const navPage = (label: L, key: string) => ({
  link: { type: 'reference', label, reference: { relationTo: 'pages', value: ref('pages', key) } },
})
const navSector = (label: L, key: string) => ({
  link: {
    type: 'reference',
    label,
    reference: { relationTo: 'sectors', value: ref('sectors', key) },
  },
})

export const HEADER = {
  items: [
    navPage(t('À propos', 'About'), 'a-propos'),
    navCustom(t('Secteurs', 'Sectors'), '/secteurs', '/sectors'),
    navCustom(t('Réalisations', 'Our work'), '/realisations', '/projects'),
    navCustom(t('Produits', 'Products'), '/produits', '/products'),
    navCustom(t('Actualités', 'News'), '/actualites', '/news'),
    navPage(t('Contact', 'Contact'), 'contact'),
  ],
}

export const FOOTER = {
  about: vocation,
  columns: [
    {
      title: t('La fondation', 'The foundation'),
      items: [
        navPage(t('À propos', 'About'), 'a-propos'),
        navCustom(t('Réalisations', 'Our work'), '/realisations', '/projects'),
        navCustom(t('Actualités', 'News'), '/actualites', '/news'),
        navPage(t('Contact', 'Contact'), 'contact'),
      ],
    },
    {
      title: t('Nos secteurs', 'Our sectors'),
      items: [
        navSector(t('Santé', 'Health'), 'sante'),
        navSector(t('Agriculture', 'Agriculture'), 'agriculture'),
        navSector(t('Élevage', 'Livestock'), 'elevage'),
        navSector(t('Pêche et pisciculture', 'Fishing and fish farming'), 'peche'),
        navSector(t('Intrants piscicoles', 'Fish farming inputs'), 'intrants'),
      ],
    },
  ],
  legalLinks: [
    navCustom(t('Mentions légales', 'Legal notice'), '/mentions-legales', '/legal-notice'),
    navCustom(t('Confidentialité', 'Privacy'), '/confidentialite', '/privacy'),
  ],
}
