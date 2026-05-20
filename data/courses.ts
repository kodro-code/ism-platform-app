export interface CourseCode {
  code: string
  label: string
  note?: string
}

export interface CourseVariant {
  label?: string    // e.g. "8-9 anos" or "40 aulas" — shown when there are multiple
  resumo: string
  pdfUrl?: string
}

export interface Course {
  slug: string
  name: string
  marketingName: string
  category: 'coding' | 'design'
  color: string
  icon: string
  isNew?: boolean
  badge?: string
  codeStatus?: string
  internalNote?: string
  ageRange?: string
  level?: string
  duration?: string
  codes: CourseCode[]
  // single variant → object, multiple variants (e.g. Roblox, FunTech) → array
  cliente: CourseVariant | CourseVariant[] | null
  conheceProduto: string | null
  comoOferir: string | null
  classeExperimental: string | null
  webinars: string | null
}

export const CATEGORIES: { id: Course['category']; label: string; color: string }[] = [
  { id: 'coding', label: 'Coding', color: '#00C2FF' },
  { id: 'design', label: 'Design', color: '#A855F7' },
]

export const COURSES: Course[] = [

  // ── CODING ────────────────────────────────────────────────────────────────

  {
    slug: 'funtech-explorers',
    name: 'FunTech Explorers',
    marketingName: 'FunTech Explorers',
    category: 'coding',
    color: '#F59E0B',
    icon: '🚀',
    ageRange: '5 - 7 anos',
    level: 'Iniciante',
    codes: [
      { code: '1633', label: 'FunTech Explorers 40 aulas' },
      { code: '1698', label: 'FunTech Explorers 80 aulas' },
    ],
    cliente: [
      {
        label: '40 aulas',
        pdfUrl: '1jyYzVjlwlH9C3ShPIYWaRhPtzGlfRHp1',
        resumo: `🔘 🚀 Bem-vindos ao curso "FunTech Explorers"! 🌈💻

🕒 Duração: 40 aulas (40 minutos, formato em grupo)
🧑‍🎓 Idade recomendada: 5 – 7 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Primeiros passos no mundo digital: Uso do computador, mouse e teclado, digitação inicial e noções básicas de tecnologia.
🔹 Pensamento lógico e algoritmos: Sequências, resolução de problemas, desafios lógicos e introdução divertida à programação.
🔹 Conceitos de programação: Loops, comandos, mensagens e lógica por meio de jogos e atividades interativas.
🔹 Exploração do computador e da internet: Estrutura de arquivos, pastas, navegação segura e uso de navegadores.
🔹 Programação em blocos com Scratch Junior: Criação de histórias animadas, jogos simples, personagens e cenários criativos.
🔹 Criatividade digital: Animações, arte digital, música, sons e padrões visuais seguindo instruções passo a passo.
🔹 Matemática aplicada à tecnologia: Operações matemáticas básicas e introdução ao Google Sheets de forma lúdica.
🔹 Criação de jogos: Desenvolvimento de jogos simples com regras, interações e desafios.
🔹 Trabalho colaborativo: Apresentação de projetos, troca de ideias e desenvolvimento da comunicação.
🔹 Projeto final e formatura: Revisão geral, desafio criativo final e construção de um portfólio digital para celebrar a jornada.

🌟 Um curso lúdico e envolvente que introduz as crianças ao universo da tecnologia, programação e criatividade digital desde cedo! 🎨🤖✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1jyYzVjlwlH9C3ShPIYWaRhPtzGlfRHp1/view?usp=sharing`,
      },
      {
        label: '80 aulas',
        pdfUrl: '1N3shDeT8nZKA0OqNpCy0qwVdp1KXYgXq',
        resumo: `🔘 🚀 Bem-vindos ao curso "FunTech Explorers – Jornada Completa"! 🌈💻

🕒 Duração: 80 aulas (40 minutos cada, formato em grupo)
🧑‍🎓 Idade recomendada: 5 – 7 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Alfabetização digital completa: Uso do computador, mouse e teclado, digitação inicial, criação de desenhos digitais, GIFs e melodias simples.
🔹 Pensamento lógico e algoritmos: Sequências, desafios lógicos, resolução de problemas e introdução gradual ao raciocínio computacional.
🔹 Programação em blocos: Programação lúdica com Scratch Junior e Scratch, criação de histórias interativas, jogos e personagens animados.
🔹 Loops, comandos e mensagens: Conceitos fundamentais de programação aplicados em jogos, robôs, histórias e atividades criativas.
🔹 Criatividade digital e design: Desenho gráfico, edição de imagens, criação de pôsteres, cartões-postais, histórias em quadrinhos e stickers no Canva.
🔹 Animação e multimídia: Criação de animações no Flipanim, vídeos simples, trilhas sonoras e projetos audiovisuais completos.
🔹 Matemática aplicada à tecnologia: Operações matemáticas básicas integradas a jogos, desafios e planilhas digitais.
🔹 Apresentações e trabalho em equipe: Criação de slides, projetos colaborativos, comunicação e apresentações criativas.
🔹 Missões, quizzes e jogos interativos: Desenvolvimento de desafios digitais com imagens, sons, regras e lógica.
🔹 Introdução à modelagem 3D: Primeiros conceitos de 3D aplicados a cenários, objetos e atividades criativas.
🔹 Projeto final e formatura: Desafios finais, criação de um portfólio digital completo e celebração da jornada de aprendizado.

🌟 Um curso completo, progressivo e encantador que acompanha a criança desde os primeiros passos no mundo digital até a criação de projetos criativos, jogos, animações e experiências em 3D! 🎨🤖🚀

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1N3shDeT8nZKA0OqNpCy0qwVdp1KXYgXq/view?usp=sharing`,
      },
    ],
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'scratch',
    name: 'Scratch',
    marketingName: 'Magia do Código com Scratch',
    category: 'coding',
    color: '#FF6B2B',
    icon: '🐱',
    ageRange: '8 - 10 anos',
    level: 'Básico',
    duration: '40 aulas',
    codes: [
      { code: '1183', label: 'Scratch', note: 'Mesmo código para as duas faixas etárias' },
    ],
    cliente: {
      pdfUrl: '1ldCw28FZ4HEOruDkks1FaGaxptHfxwPp',
      resumo: `🔘 🧙‍♂️ Bem-vindos ao curso de "Magia do código com Scratch"! 🖱️

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 8 - 10 anos
🔧 Nível: Básico

🏆 O que aprenderão ao longo do curso?

🔹 Primeiros passos no Scratch: Criação de projetos básicos e depuração de bugs.
🔹 Animações e sons: Uso de eventos, animações, cenários e música para criar apps musicais.
🔹 Criação de jogos: Conceitos de pontuação, variáveis, níveis e mecânicas interativas.
🔹 Narrativa e design: Desenvolvimento de enredos, personagens e uso de blocos personalizados.
🔹 Scratch avançado: Extensões, clones, vídeos e design de interface.
🔹 Projetos criativos: Jogos únicos, pets virtuais e aplicações com elementos de proteção.
🔹 Histórias interativas: Personagens, diálogos e decisões que influenciam a narrativa.
🔹 Projeto final (Hackathon): Planejamento, desenvolvimento, testes e apresentação de um projeto completo.

🌟 Um curso mágico que transforma criatividade em código e jogos incríveis no universo do Scratch! ✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1ldCw28FZ4HEOruDkks1FaGaxptHfxwPp/view?usp=sharing`,
    },
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'roblox',
    name: 'Roblox',
    marketingName: 'Desenvolvedor de Jogos Roblox',
    category: 'coding',
    color: '#E53E3E',
    icon: '🎮',
    ageRange: '8 - 12 anos',
    level: 'Iniciante',
    duration: '40 aulas',
    codes: [
      { code: '1184', label: 'Roblox 8-9 anos', note: 'Turmas já iniciadas' },
      { code: '1721', label: 'Roblox 8-9 anos', note: 'Turmas por iniciar' },
      { code: '1192', label: 'Roblox 10-12 anos' },
    ],
    cliente: [
      {
        label: '8-9 anos',
        pdfUrl: '18QaiPKGD2AKqhqDvmUrXGPu1pWFdPp9S',
        resumo: `🔘 🕹️ Bem-vindos ao curso de "Desenvolvedor de Jogos Roblox"! 🧱

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 8 - 9 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Criação de jogos no Roblox Studio: Modelagem 3D, design de mapas e personalização com ToolBox.
🔹 Programação em Lua: Uso de variáveis, funções, loops, condições e scripts interativos.
🔹 Física e mecânicas: Obstáculos dinâmicos, motores, checkpoints e sistemas de tempo.
🔹 Design e narrativa: Criação de NPCs, animações, missões e diálogos.
🔹 Sistemas avançados: Moedas in-game, lojas, GUI e economia virtual.
🔹 Monetização: GamePasses, itens pagos e conquistas no Roblox.
🔹 Minigames: "O Chão é Lava" e "Desvie do Obstáculo" com scripts prontos.
🔹 Projeto final: Desenvolvimento de um jogo próprio, testes e formatura com apresentação.

🌟 Um curso empolgante que transforma ideias criativas em jogos publicados no universo do Roblox! 🚀

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/18QaiPKGD2AKqhqDvmUrXGPu1pWFdPp9S/view?usp=sharing`,
      },
      {
        label: '10-12 anos',
        pdfUrl: '1Ch5dKKDVZsEv5qtxKngXLXtEJTwnKbb5',
        resumo: `🔘 🕹️ Bem-vindos ao curso de "Desenvolvedor de Jogos Roblox"! 🧱

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 10 - 12 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Criação de jogos no Roblox Studio: Modelagem 3D, design de mapas e personalização com ToolBox.
🔹 Programação em Lua: Uso de variáveis, funções, loops, condições e scripts interativos.
🔹 Física e mecânicas: Obstáculos dinâmicos, motores, checkpoints e sistemas de tempo.
🔹 Design e narrativa: Criação de NPCs, animações, missões e diálogos.
🔹 Sistemas avançados: Moedas in-game, lojas, GUI e economia virtual.
🔹 Monetização: GamePasses, itens pagos e conquistas no Roblox.
🔹 Minigames: "O Chão é Lava" e "Desvie do Obstáculo" com scripts prontos.
🔹 Projeto final: Desenvolvimento de um jogo próprio, testes e formatura com apresentação.

🌟 Um curso empolgante que transforma ideias criativas em jogos publicados no universo do Roblox! 🚀

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1Ch5dKKDVZsEv5qtxKngXLXtEJTwnKbb5/view?usp=sharing`,
      },
    ],
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'python-1',
    name: 'Python Nível 1',
    marketingName: 'Programação em Python – Nível 1',
    category: 'coding',
    color: '#3B82F6',
    icon: '🐍',
    ageRange: '+10 anos',
    level: 'Iniciante',
    duration: '40 aulas',
    codes: [
      { code: '1204', label: 'Python LVL 1 (10-12 e 13-17)', note: 'Mesmo código para as duas faixas etárias' },
    ],
    cliente: [
      {
        label: '10-12 anos',
        pdfUrl: '1FPh5UaRAOxKQ7XEWLPPC7h-4Q1kFEuNq',
        resumo: `🔘 🎨 Bem-vindos ao curso de "Programação em Python – Nível 1"! 🚀

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: +10 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Fundamentos de Python: Variáveis, tipos de dados, entrada e saída.
🔹 Controle de Fluxo: Condicionais (if, else) e laços de repetição (for, while).
🔹 Funções: Criação e uso para organizar o código.
🔹 Listas e Dicionários: Estruturas de dados para armazenar informações.
🔹 Manipulação de Arquivos: Ler e salvar dados em arquivos de texto.
🔹 Programação Orientada a Objetos: Conceitos básicos e criação de classes simples.
🔹 Projetos Práticos: Desenvolvimento de jogos simples, calculadoras e programas interativos.
🔹 Projeto Final: Um trabalho independente para aplicar tudo o que foi aprendido e apresentar aos colegas!

🌟 Um curso completo para quem quer começar a programar com Python, desenvolver o raciocínio lógico e criar seus próprios programas! ✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1FPh5UaRAOxKQ7XEWLPPC7h-4Q1kFEuNq/view?usp=sharing`,
      },
      {
        label: '+13 anos',
        pdfUrl: '1uZ3Y5DDvD_zbG6MFwOddNkk51OfBX0kV',
        resumo: `🔘 🎨 Bem-vindos ao curso de "Programação em Python – Nível 1"! 🚀

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: +13 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Fundamentos de Python: Variáveis, tipos de dados, entrada e saída.
🔹 Controle de Fluxo: Condicionais (if, else) e laços de repetição (for, while).
🔹 Funções: Criação e uso para organizar o código.
🔹 Listas e Dicionários: Estruturas de dados para armazenar informações.
🔹 Manipulação de Arquivos: Ler e salvar dados em arquivos de texto.
🔹 Programação Orientada a Objetos: Conceitos básicos e criação de classes simples.
🔹 Projetos Práticos: Desenvolvimento de jogos simples, calculadoras e programas interativos.
🔹 Projeto Final: Um trabalho independente para aplicar tudo o que foi aprendido e apresentar aos colegas!

🌟 Um curso completo para quem quer começar a programar com Python, desenvolver o raciocínio lógico e criar seus próprios programas! ✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1uZ3Y5DDvD_zbG6MFwOddNkk51OfBX0kV/view?usp=sharing`,
      },
    ],
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'python-pro',
    name: 'Python Pro',
    marketingName: 'Python Nível 2 · Pro',
    category: 'coding',
    color: '#06B6D4',
    icon: '⚡',
    ageRange: '+13 anos',
    level: 'Avançado',
    duration: '40 aulas (90 min)',
    codes: [
      { code: '1635', label: 'Python LVL 2 (13-17 anos)' },
    ],
    cliente: {
      pdfUrl: '1biOYIcHh67HTTiE10jDdBlA-APnzlihN',
      resumo: `🔘 🎓 Bem-vindos ao curso de "Python Pro"! 🚀

🕒 Duração: 40 aulas (90 minutos cada)
🧑‍🎓 Idade recomendada: +13 anos
🔧 Nível: Avançado

🏆 O que aprenderão ao longo do curso?

🔹 Automação e Bots: Criação de bots no Discord, integração com APIs, hospedagem e deploy em servidores.
🔹 Desenvolvimento Web: Fundamentos de HTML e CSS, Flask, roteamento, formulários, segurança e deploy em nuvem.
🔹 Inteligência Artificial: Aprendizado de máquina, visão computacional, manipulação de dados e treinamento de modelos próprios.
🔹 Integração de IA: Inserção de modelos de IA em projetos reais, garantindo estabilidade e escalabilidade.
🔹 Gerenciamento de Projetos: Metodologias ágeis (Agile e Scrum), colaboração em equipe, versionamento com Git e boas práticas.
🔹 Tecnologias de Voz: Criação de bots interativos com síntese de fala e princípios de código limpo.
🔹 Hackathon Final: Planejamento, desenvolvimento e apresentação de um projeto para resolver problemas reais como o aquecimento global.

🌟 Um curso completo e prático para jovens programadores que querem se tornar especialistas em Python, IA e desenvolvimento de projetos reais! ✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1biOYIcHh67HTTiE10jDdBlA-APnzlihN/view?usp=sharing`,
    },
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  // ── CRIATIVIDADE ──────────────────────────────────────────────────────────

  {
    slug: 'criatividade-digital-1',
    name: 'Criatividade Digital 1',
    marketingName: 'Criatividade Digital – Nível 1',
    category: 'design',
    color: '#A855F7',
    icon: '🎨',
    ageRange: '8 - 9 anos',
    level: 'Iniciante',
    duration: '40 aulas',
    codes: [
      { code: '1387', label: 'Criatividade Digital Lvl 1 (8-9 anos)' },
    ],
    cliente: {
      pdfUrl: '10EHt3WgAxbMT40O2Cd9WQt744XlNu-nF',
      resumo: `🔘 🎨 Bem-vindos ao curso de "Criatividade Digital – Nível 1"! 🚀

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 8 - 9 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Pixel Art e Animação: Criação de personagens, objetos e cenários animados usando o estilo Pixel Art.
🔹 Desenho Digital com Mouse: Exploração do app Kleki, uso de camadas, cores e composição para criar cartões postais e ilustrações.
🔹 Criatividade e Expressão: Estímulo à imaginação por meio de exercícios criativos, incluindo desenho baseado em formas, fotos e até música.
🔹 Design de Personagem: Técnicas para criar personagens únicos com esboços, cores e detalhes.
🔹 Modelagem 3D: Introdução ao espaço tridimensional e criação de personagens e objetos em 3D.
🔹 Histórias em Quadrinhos: Desenvolvimento de narrativas visuais com storyboard, criação de painéis e montagem de páginas de quadrinhos.
🔹 Animação Quadro a Quadro: Uso do FlipAnim para animar clima e personagens em sequência tradicional.
🔹 Animação com Quadros-Chave: Técnicas de movimento, rotação e criação de um mini desenho animado.
🔹 Edição de Vídeo: Uso do 123Apps para editar animações, adicionar narração, música e títulos.
🔹 Projeto Final: Criação de um desenho animado completo, com roteiro, cenários, personagens, animações e edição final para apresentação.

🌟 Um curso que mistura arte, tecnologia e muita imaginação! Ideal para crianças que amam desenhar, contar histórias e criar seus próprios mundos animados! ✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/10EHt3WgAxbMT40O2Cd9WQt744XlNu-nF/view?usp=sharing`,
    },
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'criatividade-digital-2',
    name: 'Criatividade Digital 2',
    marketingName: 'Criatividade Digital – Nível 2',
    category: 'design',
    color: '#8B5CF6',
    icon: '✨',
    ageRange: '10 - 12 anos',
    level: 'Iniciante',
    duration: '40 aulas',
    codes: [
      { code: '1198', label: 'Criatividade Digital Lvl 2 (10-12 anos)' },
    ],
    cliente: {
      pdfUrl: '1Hyl7D_u14u3q8d53xYQlHfE6tvs5BU8T',
      resumo: `🔘 🎨 Bem-vindos ao curso de "Criatividade Digital – Nível 2 (10-12 anos)"! 🚀

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 10 - 12 anos
🔧 Nível: Iniciante

🏆 O que aprenderão ao longo do curso?

🔹 Criação com IA e Pixel Art: Desenvolvimento de avatares e mundos usando IA e Piskel.
🔹 Animação 2D: Emoções animadas no FlipAnim e projetos completos no WickEditor.
🔹 Design Gráfico no Canva: Criação de logos, figurinhas e Brand Books.
🔹 Ilustração e HQs no Krita: Do esboço ao quadrinho final com personagens e histórias próprias.
🔹 Modelagem 3D com Spline: Criação de invenções ecológicas em ambientes tridimensionais.
🔹 Vetores no Figma: Avatares e monstros animados com gráficos vetoriais.
🔹 Criação de Sites: Desenvolvimento de portfólios online e lojas fictícias.
🔹 Projeto Final: Um trabalho independente para aplicar tudo o que foi aprendido e apresentar aos colegas!

🌟 Um curso completo para quem quer explorar a arte digital, contar histórias e dar vida às suas ideias com ferramentas modernas! ✨

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1Hyl7D_u14u3q8d53xYQlHfE6tvs5BU8T/view?usp=sharing`,
    },
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'mundos-fantasticos',
    name: 'Modelagem 3D',
    marketingName: 'Modelagem 3D com Blender',
    category: 'design',
    color: '#EC4899',
    icon: '🧊',
    ageRange: '13+ anos',
    level: 'Intermediário',
    duration: '40 aulas',
    codes: [
      { code: '1446', label: 'Modelagem 3D (13+ anos)', note: 'ex-FWD Pro' },
    ],
    internalNote: `📌 Transição FWD Pro → Modelagem 3D: Egresados e novos leads interessados em FWD Pro devem ser matriculados em Modelagem 3D. Os grupos atualmente em FWD Pro continuam normalmente até concluir o curso.`,
    cliente: {
      pdfUrl: '1u4CQqku2shUpm3u7TCT17b79Sh0--5sm',
      resumo: `🔘 🎨 Bem-vindos ao curso de "Modelagem 3D"! 🖥️
🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 13+ anos
🔧 Nível: Intermediário
🏆 O que aprenderão ao longo do curso?
🔹 Fundamentos do Blender: Escultura, modo objeto, modo edição e criação dos primeiros modelos 3D de personagens e edifícios.
🔹 Cenários e ambientes: Modelagem de locais completos com árvores, corpos d'água, modificadores e introdução à iluminação e renderização.
🔹 Interiores e texturização: Criação de cômodos detalhados com curvas de Bézier, modificadores avançados e texturas realistas.
🔹 Animação: Animação básica e avançada de objetos, visualização musical, física de líquidos, fogo e partículas.
🔹 Personagens originais: Modelagem e texturização com mapeamento UV, animação esquelética e ciclo de caminhada do próprio personagem.
🔹 Modelagem arquitetônica: Renderizações fotorrealistas de edifícios com iluminação profissional e texturas realistas.
🔹 Inteligência Artificial: Uso de IA para gerar ideias, referências e esboços de personagens como um designer 3D real.
🔹 Projeto de formatura: Desenvolvimento de um projeto original completo e montagem de portfólio profissional no Behance.
🌟 Um curso completo que transforma adolescentes em criadores 3D profissionais, do primeiro bloco ao portfólio final! ✨
📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1u4CQqku2shUpm3u7TCT17b79Sh0--5sm/view?usp=sharing`,
    },
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  // ── NOVOS LANÇAMENTOS ─────────────────────────────────────────────────────

  {
    slug: 'minecraft-1',
    name: 'Minecraft Nível 1',
    marketingName: 'Minecraft Education Nível 1',
    category: 'coding',
    color: '#22C55E',
    icon: '⛏️',
    isNew: true,
    ageRange: '8 - 9 anos',
    level: 'Iniciante',
    duration: '40 aulas',
    codeStatus: 'Em processo',
    codes: [],
    conheceProduto: '1HW_IFeSN5bVh_ysqjyzGEpB8NbK3wtgg-hMbOnxf0p8',
    cliente: {
      pdfUrl: '1z9AsckHtrqceQ5jPITtDtcrsuNAyYe6Y',
      resumo: `🔘 ⛏️ Bem-vindos ao curso de "Minecraft Education Nivel 1: Crie seu mundo com código"! 🖱️
🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 8 - 9 anos
🔧 Nível: Iniciante
🏆 O que aprenderão ao longo do curso?
🔹 Primeiros passos no Minecraft Education: Exploração do ambiente, comandos básicos no MakeCode e controle do Agente.
🔹 Algoritmos e loops: De ações simples a automações, usando repetição para construir estruturas e mecanismos.
🔹 Construção em equipe: Planejamento colaborativo de edifícios, cidades e praças com redstone e observers.
🔹 Coordenadas e clonagem: Construções de grande escala com loops aninhados, comando clone e casas inteligentes.
🔹 Jogos e puzzles: Eventos, condições, variáveis e temporizadores para criar minijogos personalizados no MakeCode.
🔹 Automação de fazendas: Agente jardineiro, separação de recursos, fazenda de mobs e armazenamento automatizado.
🔹 Projeto final: Da ideia ao código — planejamento, funções, tratamento de eventos e apresentação para a turma e os pais.
🌟 Um curso incrível que transforma criatividade em código e construções automatizadas no universo do Minecraft! ✨
📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1z9AsckHtrqceQ5jPITtDtcrsuNAyYe6Y/view?usp=sharing`,
    },
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'minecraft-2',
    name: 'Minecraft Nível 2',
    marketingName: 'Minecraft Education Nível 2',
    category: 'coding',
    color: '#16A34A',
    icon: '🏗️',
    isNew: true,
    ageRange: '10 - 11 anos',
    level: 'Iniciante',
    duration: '40 aulas',
    codeStatus: 'Em processo',
    codes: [],
    conheceProduto: '1DuTUuMZIzbQ9OTqgLYD3VFY3x40FmzaNMI6Zft5gO7c',
    cliente: {
      pdfUrl: '1wNt5Y5Vpa-no2iJ67qFApKnTGIPbBpU1',
      resumo: `🔘 🐍 Bem-vindos ao curso de "Minecraft Education Nível 2: Criando programas em Python dentro do jogo!"! 🖱️
🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 10 - 11 anos
🔧 Nível: Iniciante
🏆 O que aprenderão ao longo do curso?
🔹 Primeiros passos em Python: Comandos básicos, controle do Agente, loops e construção de algoritmos dentro do Minecraft.
🔹 Loops, variáveis e funções: Loops aninhados, valores aleatórios, iterações em 3D e funções personalizadas com parâmetros.
🔹 Agente Inteligente: Condições If/else, listas, operadores e múltiplas condições para que o Agente tome decisões sozinho.
🔹 Coordenadas e eventos: Eixos x, y e z, geração de paisagens aleatórias, teletransporte e reações aos movimentos do jogador.
🔹 Inteligência Artificial: Como a IA funciona, ética no uso da tecnologia e como criar prompts eficientes para melhorar o código.
🔹 Projeto final: Criação de um minijogo completo no Minecraft com temporizador, sistema de pontuação e apresentação para a turma.
🌟 Um curso incrível que transforma alunos em verdadeiros programadores, escrevendo Python real dentro do universo do Minecraft! ✨
📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1wNt5Y5Vpa-no2iJ67qFApKnTGIPbBpU1/view?usp=sharing`,
    },
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

  {
    slug: 'unity',
    name: 'Unity',
    marketingName: 'Jogos 3D no Unity',
    category: 'coding',
    color: '#6366F1',
    icon: '🎯',
    badge: 'PROXIMAMENTE',
    ageRange: '13+ anos',
    level: 'Experientes',
    duration: '40 aulas',
    codes: [],
    cliente: {
      pdfUrl: '1zfK4C-MyA1Sca2o8wU4xFJry5Pd9Zask',
      resumo: `🔘 🎮 Bem-vindos ao curso de "Jogos 3D no Unity"! 🚀

🕒 Duração: 40 aulas
🧑‍🎓 Idade recomendada: 13+ anos
🔧 Nível: Usuários experientes

🏆 O que aprenderão ao longo do curso?

🔹 Unity e C# desde o início: Criação de jogos estilo runner com programação em C# e controle de câmera.
🔹 Interface do usuário e efeitos: Geração de níveis, efeitos visuais, sons e publicação no Kodland HUB.
🔹 Jogos de tiro em primeira pessoa: Design de personagens, IA de inimigos, armas e mecânicas de tiro.
🔹 Programação orientada a objetos (POO): Classes, herança, polimorfismo e criação de personagens com habilidades únicas.
🔹 Jogos 2D com física: Criação de jogos estilo platformer com animações, obstáculos e HUD de saúde.
🔹 Criação de jogo estilo Fall Guys: Física 3D, obstáculos dinâmicos, efeitos avançados e uso de listas e randomização.
🔹 Física avançada no Unity: Uso de materiais, modelagem com ProBuilder e construção de níveis verticais desafiadores.
🔹 Projeto de formatura: Criação de um jogo completo, controle de versão com GitHub, testes beta e publicação no Itch.io.

🌟 Um curso completo para quem quer dominar o Unity, programar em C# e publicar jogos incríveis com design profissional! 🎯

📄 Conteúdo completo em PDF:
👉 https://drive.google.com/file/d/1zfK4C-MyA1Sca2o8wU4xFJry5Pd9Zask/view?usp=sharing`,
    },
    conheceProduto: null,
    comoOferir: null,
    classeExperimental: null,
    webinars: null,
  },

]
