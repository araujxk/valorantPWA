/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AgentMeta {
  id: string;
  uuid: string; // From valorant-api.com
  name: string;
  role: 'controller' | 'initiator' | 'sentinel' | 'duelist';
  avatar: string; // Gradient color indicator or letter representation for zero-dependency style
  color: string;  // Branding color
  abilities: { id: string; name: string; description: string }[];
}

export interface MapMeta {
  id: string;
  name: string;
  brief: string;
  minimapUrl: string; // Tactical overhead minimap (tactic file)
  splashUrl?: string; // Illustration/thumbnail for card backgrounds
}

export const AGENTS_LIST: AgentMeta[] = [
  // DUELISTS
  {
    id: 'jett',
    uuid: 'add6443a-41bd-e414-f6ad-e58d267f4e95',
    name: 'Jett',
    role: 'duelist',
    avatar: '💨',
    color: 'from-cyan-400 to-blue-600',
    abilities: [
      { id: 'cloudburst', name: 'Cloudburst (C)', description: 'Lança instantaneamente um projétil que se expande duma nuvem de fumaça temporária.' },
      { id: 'updraft', name: 'Updraft (Q)', description: 'Impulsiona instantaneamente Jett para o alto após um curto atraso.' },
      { id: 'tailwind', name: 'Tailwind (E)', description: 'Impulsiona instantaneamente Jett na direção em que se está a mover.' },
      { id: 'blade_storm', name: 'Blade Storm (X)', description: 'Equipa um conjunto de facas de arremesso altamente precisas.' }
    ]
  },
  {
    id: 'reyna',
    uuid: 'a3bfb853-43b2-7238-a4f1-ad90e9e46bcc',
    name: 'Reyna',
    role: 'duelist',
    avatar: '👁️‍🗨️',
    color: 'from-purple-500 to-fuchsia-900',
    abilities: [
      { id: 'leer', name: 'Leer (C)', description: 'Equipa um olho etéreo que cega os inimigos que olharem para ele.' },
      { id: 'devour', name: 'Devour (Q)', description: 'Consome a força vital de inimigos abatidos para restaurar vida.' },
      { id: 'dismiss', name: 'Dismiss (E)', description: 'Consome a força vital de inimigos abatidos para se tornar intangível.' },
      { id: 'empress', name: 'Empress (X)', description: 'Entra num frenesim sanguinário com bônus de cadência de tiro e uso infinito de habilidades.' }
    ]
  },
  {
    id: 'phoenix',
    uuid: 'eb93336a-449b-9c1b-0a54-a891f7921d69',
    name: 'Phoenix',
    role: 'duelist',
    avatar: '🔥',
    color: 'from-orange-400 to-red-600',
    abilities: [
      { id: 'blaze', name: 'Blaze (C)', description: 'Ergue uma parede de fogo que bloqueia a visão e cura Phoenix.' },
      { id: 'curveball', name: 'Curveball (Q)', description: 'Lança um orbe flamejante que curva e detona, cegando inimigos.' },
      { id: 'hot_hands', name: 'Hot Hands (E)', description: 'Lança uma bola de fogo que cobre o chão com chamas, causando dano e curando Phoenix.' },
      { id: 'run_it_back', name: 'Run it Back (X)', description: 'Cria um marcador. Se morrer durante a ultimate ou ela acabar, renasce no marcador.' }
    ]
  },
  {
    id: 'raze',
    uuid: 'f94c3b30-42be-e959-889c-5aa313dba261',
    name: 'Raze',
    role: 'duelist',
    avatar: '💣',
    color: 'from-orange-500 to-amber-700',
    abilities: [
      { id: 'boom_bot', name: 'Boom Bot (C)', description: 'Um robô que procura e persegue inimigos, explodindo ao acertar.' },
      { id: 'blast_pack', name: 'Blast Pack (Q)', description: 'Carga explosiva que adere a superfícies e pode ser detonada para impulso ou dar dano.' },
      { id: 'paint_shells', name: 'Paint Shells (E)', description: 'Granada de fragmentação primária que explode e lança submunições.' },
      { id: 'showstopper', name: 'Showstopper (X)', description: 'Equipa um lança-mísseis que causa dano em área massivo em impacto.' }
    ]
  },
  {
    id: 'yoru',
    uuid: '7f94d92c-4234-0a36-9646-3a87eb8b5c89',
    name: 'Yoru',
    role: 'duelist',
    avatar: '🌌',
    color: 'from-blue-600 to-indigo-900',
    abilities: [
      { id: 'fakeout', name: 'Fakeout (C)', description: 'Kopia que imita Yoru correndo e cega quem atirar nela.' },
      { id: 'blindside', name: 'Blindside (Q)', description: 'Fragmento dimensional que ressalta numa parede antes de cegar inimigos.' },
      { id: 'gatecrash', name: 'Gatecrash (E)', description: 'Fenda direcional que Yoru pode usar para se teletransportar.' },
      { id: 'dimensional_drift', name: 'Dimensional Drift (X)', description: 'Entra noutra dimensão para ficar invisível e invulnerável a inimigos.' }
    ]
  },
  {
    id: 'neon',
    uuid: 'bb2a4828-46eb-8cd1-e765-15848195d751',
    name: 'Neon',
    role: 'duelist',
    avatar: '⚡',
    color: 'from-blue-400 to-cyan-700',
    abilities: [
      { id: 'fast_lane', name: 'Fast Lane (C)', description: 'Cria duas paredes de energia eletrostática bloqueando a visão.' },
      { id: 'relay_bolt', name: 'Relay Bolt (Q)', description: 'Concussão elétrica que ressalta e detona no chão.' },
      { id: 'high_gear', name: 'High Gear (E)', description: 'Canaliza energia para correr rapidamente e realizar um slide tático.' },
      { id: 'overdrive', name: 'Overdrive (X)', description: 'Velocidade máxima e canalização de raios elétricos mortais das mãos.' }
    ]
  },
  {
    id: 'iso',
    uuid: '0e38b510-41a8-5780-5e8f-568b2a4f2d6c',
    name: 'Iso',
    role: 'duelist',
    avatar: '🛡️',
    color: 'from-violet-500 to-purple-800',
    abilities: [
      { id: 'contingency', name: 'Contingency (C)', description: 'Conjura uma barreira indestrutível que avança numa linha reta.' },
      { id: 'undercut', name: 'Undercut (Q)', description: 'Lança um projétil molecular que atravessa paredes e aplica vulnerabilidade.' },
      { id: 'double_tap', name: 'Double Tap (E)', description: 'Inicia um temporizador focado. Matar cria um orbe que, se atingido, garante um escudo absorvedor de dano.' },
      { id: 'kill_contract', name: 'Kill Contract (X)', description: 'Arrasta a si próprio e ao alvo para uma arena interdimensional 1v1.' }
    ]
  },

  // CONTROLLERS
  {
    id: 'viper',
    uuid: '707eab51-4836-f488-046a-cda6bf494859',
    name: 'Viper',
    role: 'controller',
    avatar: '🐍',
    color: 'from-emerald-600 to-green-900',
    abilities: [
      { id: 'snake_bite', name: 'Snake Bite (C)', description: 'Lança um frasco de ácido que se espalha pelo chão, dando dano e fragilidade.' },
      { id: 'poison_cloud', name: 'Poison Cloud (Q)', description: 'Instala um emissor de gás combustível que consome combustível para formar uma nuvem de fumo nociva.' },
      { id: 'toxic_screen', name: 'Toxic Screen (E)', description: 'Uma longa linha de emissores de gás para criar uma parede de fumo bloqueadora de visão.' },
      { id: 'vipers_pit', name: 'Viper\'s Pit (X)', description: 'Gera uma nuvem química gigante em redor que drena a vida solar dos inimigos em seu redor.' }
    ]
  },
  {
    id: 'omen',
    uuid: '8e253930-4c05-31dd-1b6c-968525494517',
    name: 'Omen',
    role: 'controller',
    avatar: '👻',
    color: 'from-indigo-600 to-purple-900',
    abilities: [
      { id: 'shrouded_step', name: 'Shrouded Step (C)', description: 'Teletransporte tático de curto alcance.' },
      { id: 'paranoia', name: 'Paranoia (Q)', description: 'Projétil sombrio que atravessa paredes cegando todos que toca.' },
      { id: 'dark_cover', name: 'Dark Cover (E)', description: 'Esfera sombria lançada furtivamente que bloqueia a visão.' },
      { id: 'from_the_shadows', name: 'From the Shadows (X)', description: 'Teletransporte global para qualquer local no mapa tático.' }
    ]
  },
  {
    id: 'brimstone',
    uuid: '9f0d8ba9-4140-b941-57d3-a7ad57c6b417',
    name: 'Brimstone',
    role: 'controller',
    avatar: '🔥',
    color: 'from-orange-600 to-red-900',
    abilities: [
      { id: 'incendiary', name: 'Incendiary (Q)', description: 'Equipa um lança-granadas que arremessa uma granada de incêndio para criar uma zona mortífera.' },
      { id: 'sky_smoke', name: 'Sky Smoke (E)', description: 'Utiliza o braço tático para invocar três smokes orbitais com grande duração.' },
      { id: 'stim_beacon', name: 'Stim Beacon (C)', description: 'Arremessa facho acelerador que garante cadência acrescida aos aliados.' },
      { id: 'orbital_strike', name: 'Orbital Strike (X)', description: 'Invocação de raio de laser orbital catastrófico focado.' }
    ]
  },
  {
    id: 'astra',
    uuid: '41fb69c1-4189-7b37-f117-bcaf1e96f1bf',
    name: 'Astra',
    role: 'controller',
    avatar: '✨',
    color: 'from-fuchsia-500 to-purple-800',
    abilities: [
      { id: 'gravity_well', name: 'Gravity Well (C)', description: 'Puxa e debilita jogadores apanhados no alcance.' },
      { id: 'nova_pulse', name: 'Nova Pulse (Q)', description: 'Uma carga de energia que concussa imediatamente os inimigos.' },
      { id: 'nebula', name: 'Nebula / Dissipate (E)', description: 'Transfere estrelas numa nuvem fumarenta nebulosa.' },
      { id: 'cosmic_divide', name: 'Cosmic Divide (X)', description: 'Uma parede cósmica imensa que amortece o som e barra tiros perfurantes.' }
    ]
  },
  {
    id: 'harbor',
    uuid: '95b78ed7-4637-86d9-7e41-71ba8c293152',
    name: 'Harbor',
    role: 'controller',
    avatar: '🌊',
    color: 'from-cyan-600 to-blue-900',
    abilities: [
      { id: 'cascade', name: 'Cascade (C)', description: 'Envia uma onda de água para a frente que abranda e passa por paredes.' },
      { id: 'cove', name: 'Cove (Q)', description: 'Esfera de água que absorve balas até as ser destruída.' },
      { id: 'high_tide', name: 'High Tide (E)', description: 'Uma enorme parede de água guiável.' },
      { id: 'reckoning', name: 'Reckoning (X)', description: 'Invoca uma cascata num terreno que concussa oponentes.' }
    ]
  },
  {
    id: 'clove',
    uuid: '1dbf2edd-4729-0984-3115-daa5eed44993',
    name: 'Clove',
    role: 'controller',
    avatar: '🦋',
    color: 'from-pink-500 to-rose-700',
    abilities: [
      { id: 'pick_me_up', name: 'Pick-me-up (C)', description: 'Absorve energia de um inmigo morto para um buff temporário de velocidade e vida.' },
      { id: 'meddle', name: 'Meddle (Q)', description: 'Fragmento de essência que detona deteriorando a vida de oponentes no alcance.' },
      { id: 'ruse', name: 'Ruse (E)', description: 'Conjuração orquestrada de fumaça que pode ser usada inclusive depois de morrer.' },
      { id: 'not_dead_yet', name: 'Not Dead Yet (X)', description: 'Imortalidade temporária após morrer, necessita de matar ou assistir para persistir.' }
    ]
  },

  // INITIATORS
  {
    id: 'sova',
    uuid: '320b2a48-4d9b-a075-30f1-1f93a9b638fa',
    name: 'Sova',
    role: 'initiator',
    avatar: '🏹',
    color: 'from-sky-500 to-blue-800',
    abilities: [
      { id: 'shock_bolt', name: 'Shock Dart (C)', description: 'Lança uma seta elétrica destrutiva que depara ondas de choque em impacto.' },
      { id: 'recon_bolt', name: 'Recon Bolt (E)', description: 'Seta de revelação tática que varre a linha de visão revelando posições inimigas.' },
      { id: 'owl_drone', name: 'Owl Drone (Q)', description: 'Drone de exploração telecomandado que dispara dardos marcadores.' },
      { id: 'hunters_fury', name: 'Hunter\'s Fury (X)', description: 'Dispara até três raios de energia destrutivos que atravessam mapa inteiro.' }
    ]
  },
  {
    id: 'breach',
    uuid: '5f8d3a7f-467b-97f3-062c-13acf203c006',
    name: 'Breach',
    role: 'initiator',
    avatar: '💥',
    color: 'from-orange-500 to-green-700',
    abilities: [
      { id: 'aftershock', name: 'Aftershock (C)', description: 'Carga explosiva que causa muito dano através das paredes em disparos secundários repetidos.' },
      { id: 'flashpoint', name: 'Flashpoint (Q)', description: 'Rajada de escuridão incandescente através de obstáculos.' },
      { id: 'fault_line', name: 'Fault Line (E)', description: 'Carga geológica que tonteia em retângulo de área sísmica.' },
      { id: 'rolling_thunder', name: 'Rolling Thunder (X)', description: 'Terramoto devastador num cone à frente.' }
    ]
  },
  {
    id: 'skye',
    uuid: '6f2a04ca-43e0-be17-7f36-b3908627744d',
    name: 'Skye',
    role: 'initiator',
    avatar: '🦅',
    color: 'from-lime-500 to-green-800',
    abilities: [
      { id: 'regrowth', name: 'Regrowth (C)', description: 'Área de cura canalizada para aliados num perímetro.' },
      { id: 'trailblazer', name: 'Trailblazer (Q)', description: 'Controla a predadora Tasmniana para caçar e tontear inimigos.' },
      { id: 'guiding_light', name: 'Guiding Light (E)', description: 'Falcão passarinheiro cegante controlável durante o voo e detonável.' },
      { id: 'seekers', name: 'Seekers (X)', description: 'Três predadores que perseguem os três inimigos mais perto causando curtos-circuitos.' }
    ]
  },
  {
    id: 'kayo',
    uuid: '601dbbe7-43ce-be57-2a40-4abd24953621',
    name: 'KAY/O',
    role: 'initiator',
    avatar: '🤖',
    color: 'from-cyan-500 to-indigo-800',
    abilities: [
      { id: 'frag_ment', name: 'FRAG/ment (C)', description: 'Granada de múltiplos pulsos letais no centro.' },
      { id: 'flash_drive', name: 'FLASH/drive (Q)', description: 'Granada de atordoamento luminosa flashbang.' },
      { id: 'zero_point', name: 'ZERO/point (E)', description: 'Faca supressora de código que revela localizações.' },
      { id: 'null_cmd', name: 'NULL/cmd (X)', description: 'Onda gigante de imensa supressão inimiga e estabilização de sistema no modo de dor.' }
    ]
  },
  {
    id: 'fade',
    uuid: 'dade69b4-4f5a-8528-247b-219e5a1facd6',
    name: 'Fade',
    role: 'initiator',
    avatar: '👁️',
    color: 'from-indigo-700 to-slate-900',
    abilities: [
      { id: 'prowler', name: 'Prowler (C)', description: 'Criatura perseguidora que rasteja até ao inimigo para lhe causar miopia imediata.' },
      { id: 'seize', name: 'Seize (Q)', description: 'Nó de pesadelo que explode capturando e ensurdecendo quem estiver no perímetro.' },
      { id: 'haunt', name: 'Haunt (E)', description: 'Lança um olho espectral que desce após breves segundos para revelar todos os oponentes.' },
      { id: 'nightfall', name: 'Nightfall (X)', description: 'Emissor de terror onírico marcando e enfraquecendo os afetados.' }
    ]
  },
  {
    id: 'gekko',
    uuid: 'e370fa57-4757-3604-3648-499e1f642d3f',
    name: 'Gekko',
    role: 'initiator',
    avatar: '🐾',
    color: 'from-lime-400 to-emerald-700',
    abilities: [
      { id: 'mosh_pit', name: 'Mosh Pit (C)', description: 'Lança e expande poça venenosa extremamente letal.' },
      { id: 'wingman', name: 'Wingman (Q)', description: 'Ajudante fofo que procura oponentes para tontear e até pode defuse/plant spike.' },
      { id: 'dizzy', name: 'Dizzy (E)', description: 'Ajudante arremessado que cospe manchas cegantes para curtos instantes.' },
      { id: 'thrash', name: 'Thrash (X)', description: 'Controlo telepático com lunge explosiva subalterna desativando inimigos.' }
    ]
  },

  // SENTINELS
  {
    id: 'sage',
    uuid: '569fdd95-4d10-43ab-ca70-79becc718b46',
    name: 'Sage',
    role: 'sentinel',
    avatar: '🧊',
    color: 'from-teal-400 to-cyan-700',
    abilities: [
      { id: 'barrier_orb', name: 'Barrier Orb (C)', description: 'Parede massiva de gelo de proteção.' },
      { id: 'slow_orb', name: 'Slow Orb (Q)', description: 'Cria uma zona cristalina que atrasa movimentos adversários.' },
      { id: 'healing_orb', name: 'Healing Orb (E)', description: 'Regenera progressivamente vida de outro companheiro.' },
      { id: 'resurrection', name: 'Resurrection (X)', description: 'Uma dádiva em prece de cura absoluta de quem renascer as pessoas caídas.' }
    ]
  },
  {
    id: 'cypher',
    uuid: '117ed9e3-49f3-6512-3ccf-0cada7e3823b',
    name: 'Cypher',
    role: 'sentinel',
    avatar: '🕵️',
    color: 'from-zinc-500 to-slate-800',
    abilities: [
      { id: 'trapwire', name: 'Trapwire (C)', description: 'Fio de armadilha esticado invisível que revela, tonteia e prende inimigos detetados.' },
      { id: 'cyber_cage', name: 'Cyber Cage (Q)', description: 'Barreira cibernética de fumo e som retardador.' },
      { id: 'spycam', name: 'Spycam (E)', description: 'Câmara secreta monitorizadora que dispara marcas dardo.' },
      { id: 'neural_theft', name: 'Neural Theft (X)', description: 'Usa falecido adversário para emitir sinal que descobre instantaneamente equipa inteira.' }
    ]
  },
  {
    id: 'killjoy',
    uuid: '1e58de9c-4950-5125-93e9-a0aee9f98746',
    name: 'Killjoy',
    role: 'sentinel',
    avatar: '🛠️',
    color: 'from-yellow-500 to-amber-700',
    abilities: [
      { id: 'alarmbot', name: 'Alarmbot (Q)', description: 'Dispositivo eletrónico inteligente que persegue inimigos que entrem na sua área.' },
      { id: 'turret', name: 'Turret (E)', description: 'Metralhadora automática com arco de visão de 180 graus.' },
      { id: 'nanoswarm', name: 'Nanoswarm (C)', description: 'Granada de enxame oculta que ativa remotamente uma nuvem de nanoswarms lacerantes.' },
      { id: 'lockdown', name: 'Lockdown (X)', description: 'Emissor de campo gigante que detém temporariamente todos no seu raio após ativação.' }
    ]
  },
  {
    id: 'chamber',
    uuid: '22697a3d-45bf-8dd7-4fec-84a9e28c69d7',
    name: 'Chamber',
    role: 'sentinel',
    avatar: '👔',
    color: 'from-amber-400 to-yellow-700',
    abilities: [
      { id: 'trademark', name: 'Trademark (C)', description: 'Scanner do chão lento sobre passagem inimiga.' },
      { id: 'headhunter', name: 'Headhunter (Q)', description: 'Um revólver clássico mortífero com um limite alto de precisão.' },
      { id: 'rendezvous', name: 'Rendezvous (E)', description: 'Cria portais na zona para se afastar fugazmente para defesor em segredo.' },
      { id: 'tour_de_force', name: 'Tour De Force (X)', description: 'Evoca grande sniper de um tiro que paralisa a base abaixo dos que atingir.' }
    ]
  },
  {
    id: 'deadlock',
    uuid: 'cc8b64c8-4b25-4ff9-6e7f-37b4da43d235',
    name: 'Deadlock',
    role: 'sentinel',
    avatar: '🕸️',
    color: 'from-slate-300 to-zinc-600',
    abilities: [
      { id: 'gravnet', name: 'GravNet (C)', description: 'Granada de gravidade severa forçando todos no cone à pranchar os pés.' },
      { id: 'sonic_sensor', name: 'Sonic Sensor (Q)', description: 'Surdo sensorial ativado apenas com ruído rápido de oponentes que ensurdece inimigos.' },
      { id: 'barrier_mesh', name: 'Barrier Mesh (E)', description: 'Estrela em 4 blocos imensos de deflexão indestrutíveis sem esforço inimigo.' },
      { id: 'annihilation', name: 'Annihilation (X)', description: 'Enrola alguém com os nanofios encurralando para execução passiva ao final de tempo.' }
    ]
  }
];

export const MAPS_LIST: MapMeta[] = [
  {
    id: 'bind',
    name: 'Bind',
    brief: 'Dois portais e ausência de Meio tático definem este mapa desértico.',
    minimapUrl: '/maps/bind-tactic.png',
    splashUrl: '/maps/bind.png'
  },
  {
    id: 'ascent',
    name: 'Ascent',
    brief: 'Mapa clássico europeu com portas metálicas suspensas e meio muito disputado.',
    minimapUrl: '/maps/ascent-tactic.png',
    splashUrl: '/maps/ascent.png'
  },
  {
    id: 'lotus',
    name: 'Lotus',
    brief: 'Um templo em ruínas com três locais de plant e portas rotativas dinâmicas.',
    minimapUrl: '/maps/lotus-tactic.png',
    splashUrl: '/maps/lotus.png'
  },
  {
    id: 'breeze',
    name: 'Breeze',
    brief: 'Paraíso tropical de grandes dimensões, linhas de mira extremamente longas.',
    minimapUrl: '/maps/breeze-tactic.png',
    splashUrl: '/maps/breeze.png'
  },
  {
    id: 'split',
    name: 'Split',
    brief: 'Metrópole industrial caracterizada por cordas de ascensão para defesa crucial.',
    minimapUrl: '/maps/split-tactic.png',
    splashUrl: '/maps/split.png'
  },
  {
    id: 'haven',
    name: 'Haven',
    brief: 'Três locais de plant e conetores apertados definem este mapa dinâmico.',
    minimapUrl: '/maps/haven-tactic.png',
    splashUrl: '/maps/haven.png'
  },
  {
    id: 'pearl',
    name: 'Pearl',
    brief: 'Cidade subaquática portuguesa com corredores apertados e meio contestado.',
    minimapUrl: '/maps/pearl-tactic.png',
    splashUrl: '/maps/pearl.png'
  },
  {
    id: 'icebox',
    name: 'Icebox',
    brief: 'Base ártica com ziplines e terreno elevado que define os confrontos.',
    minimapUrl: '/maps/icebox-tactic.png',
    splashUrl: '/maps/icebox.png'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    brief: 'Ruas de Los Angeles ao entardecer com portas e flancos assimétricos.',
    minimapUrl: '/maps/sunset-tactic.png',
    splashUrl: '/maps/sunset.png'
  },
  {
    id: 'fracture',
    name: 'Fracture',
    brief: 'Instalação experimental com atacantes a entrar dos dois lados do mapa.',
    minimapUrl: '/maps/fracture-tactic.png',
    splashUrl: '/maps/fracture.png'
  },
  {
    id: 'abyss',
    name: 'Abyss',
    brief: 'Plataformas suspensas sobre o abismo com bordas que significam morte instantânea.',
    minimapUrl: '/maps/abyss-tactic.png',
    splashUrl: '/maps/abyss.png'
  },
  {
    id: 'corrode',
    name: 'Corrode',
    brief: 'Mapa industrial com estruturas corroídas e linhas de mira fechadas.',
    minimapUrl: '/maps/corrode-tactic.png',
    splashUrl: '/maps/corrode.png'
  },
  {
    id: 'summit',
    name: 'Summit',
    brief: 'Estação de montanha com combates a diferentes altitudes.',
    minimapUrl: '/maps/summit-tactic.png',
    splashUrl: '/maps/summit.png'
  }
];

export function getAgentName(id: string): string {
  const agent = AGENTS_LIST.find(a => a.id === id);
  return agent ? agent.name : id.toUpperCase();
}

export function getAbilityName(agentId: string, abilityId: string): string {
  const agent = AGENTS_LIST.find(a => a.id === agentId);
  if (!agent) return abilityId;
  const ability = agent.abilities.find(ab => ab.id === abilityId);
  return ability ? ability.name : abilityId.toUpperCase();
}
