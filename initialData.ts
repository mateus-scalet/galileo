import { Vacancy } from './types';

export const getInitialVacancies = (): Vacancy[] => {
  return [
    // Vaga 1: Engenheiro de Software
    {
      id: "vac_172001",
      jobDetails: {
        title: "Engenheiro de Software Sênior (React)",
        level: "Especialista",
        description: "Buscamos um Engenheiro de Software Sênior especialista em React para liderar o desenvolvimento de nosso front-end, focado em performance, escalabilidade e qualidade de código. O candidato ideal tem vasta experiência com o ecossistema React, incluindo Redux, Next.js e testes automatizados.",
        numQuestions: 3,
        bias: 1,
      },
      questions: [
        {
          type: 'check',
          question: "Você possui mais de 5 anos de experiência com desenvolvimento React?",
          expectedAnswer: 'yes'
        },
        {
          type: 'behavioral',
          question: "Descreva um projeto complexo em React que você liderou. Quais foram os maiores desafios técnicos e como você os superou?",
          criteria: [
            { text: "Liderança Técnica e Arquitetura", points: 4 },
            { text: "Resolução de Problemas Complexos", points: 4 },
            { text: "Comunicação e Clareza", points: 2 }
          ],
          baselineAnswer: "Em um projeto anterior, liderei a migração de uma arquitetura monolítica para micro-frontends usando Module Federation. O principal desafio foi coordenar o estado compartilhado e a autenticação entre as diferentes aplicações. Solucionamos isso criando uma biblioteca compartilhada de componentes e um serviço de autenticação centralizado que emitia tokens JWT. Isso permitiu que as equipes de trabalhassem de forma autônoma, mantendo a consistência da interface e da experiência do usuário."
        },
        {
          type: 'behavioral',
          question: "Como você otimiza a performance de uma aplicação React? Fale sobre técnicas como memoization, code splitting e profiling.",
          criteria: [
            { text: "Conhecimento em Performance (Memo, Lazy, etc.)", points: 5 },
            { text: "Experiência com Ferramentas (Profiler, Lighthouse)", points: 3 },
            { text: "Aplicação Prática e Exemplos", points: 2 }
          ],
          baselineAnswer: "Para otimização, utilizo uma abordagem multifacetada. Primeiro, aplico memoização com `React.memo`, `useMemo` e `useCallback` para evitar re-renderizações desnecessárias. Em segundo lugar, implemento code splitting em nível de rota com `React.lazy` e `Suspense` para reduzir o tamanho do bundle inicial. Finalmente, uso o React Profiler para identificar componentes que demoram para renderizar e o Lighthouse para auditar a performance geral, abordando questões como o tempo para interatividade (TTI)."
        },
        {
          type: 'behavioral',
          question: "Qual a sua abordagem para garantir a qualidade do código em um time? Fale sobre testes, code review e CI/CD.",
          criteria: [
            { text: "Estratégia de Testes (Unit, Integration, E2E)", points: 4 },
            { text: "Processos de Qualidade (Code Review, Linting)", points: 3 },
            { text: "Conhecimento em CI/CD", points: 3 }
          ],
          baselineAnswer: "Minha abordagem para qualidade se baseia em três pilares. Primeiro, uma sólida estratégia de testes, seguindo a pirâmide de testes com Jest e React Testing Library para testes unitários e de integração, e Cypress para E2E. Segundo, um processo de code review rigoroso, onde cada pull request deve ser revisado por pelo menos dois outros desenvolvedores. Terceiro, um pipeline de CI/CD automatizado (usando GitHub Actions) que roda linters, testes e verificações de segurança a cada commit, garantindo que apenas código de alta qualidade seja mesclado na base principal."
        }
      ],
      candidates: [
        {
          id: "cand_001",
          candidateName: "Ana Oliveira",
          interviewDate: "2024-07-20T10:00:00Z",
          checkAnswers: [
             { question: "Você possui mais de 5 anos de experiência com desenvolvimento React?", answer: 'yes' }
          ],
          answers: [
            { question: "Descreva um projeto complexo em React que você liderou. Quais foram os maiores desafios técnicos e como você os superou?", answer: "Liderei a refatoração de um monolito para micro-frontends. O maior desafio foi garantir a comunicação entre os MFs sem acoplamento e manter um estado global consistente. Usei Module Federation do Webpack e criei uma camada de eventos customizada." },
            { question: "Como você otimiza a performance de uma aplicação React? Fale sobre técnicas como memoization, code splitting e profiling.", answer: "Uso React.memo e useMemo extensivamente para evitar re-renderizações. O code splitting é feito por rotas com React.lazy e Suspense. Utilizo o React Profiler para identificar gargalos e o Lighthouse para métricas gerais." },
            { question: "Qual a sua abordagem para garantir a qualidade do código em um time? Fale sobre testes, code review e CI/CD.", answer: "Defendo uma pirâmide de testes com Jest/RTL para unitários/integração e Cypress para E2E. O processo de PR inclui code reviews rigorosos com no mínimo 2 aprovações e um pipeline de CI/CD no GitHub Actions que roda testes e linting a cada commit." }
          ],
          evaluation: {
            globalGrade: 9.2,
            summary: "Candidata excepcional com profundo conhecimento técnico, experiência de liderança e foco em qualidade. Demonstrou maestria nos conceitos de arquitetura e performance em React.",
            strengths: "- Liderança técnica e visão de arquitetura.\n- Profundo conhecimento em otimização de performance.\n- Defensora de processos sólidos de qualidade.",
            areasForImprovement: "- Poderia explorar mais sobre testes de carga.\n- Aprofundar em ferramentas de monitoramento em produção.",
            questionGrades: [
              { question: "Descreva um projeto complexo em React que você liderou. Quais foram os maiores desafios técnicos e como você os superou?", grade: 9.5, justification: "Resposta excelente e detalhada.", criterionGrades: [{criterion: "Liderança Técnica e Arquitetura", grade: 10, justification: "Demonstrou clara liderança e ótima escolha arquitetural."}, {criterion: "Resolução de Problemas Complexos", grade: 9, justification: "Solução elegante para um problema complexo."}, {criterion: "Comunicação e Clareza", grade: 10, justification: "Explicou de forma muito clara."}], originalityScore: 12, originalityJustification: "A resposta utiliza exemplos específicos e detalhados de um projeto real, demonstrando experiência autêntica e não um roteiro genérico." },
              { question: "Como você otimiza a performance de uma aplicação React? Fale sobre técnicas como memoization, code splitting e profiling.", grade: 9.0, justification: "Cobriu todos os pontos com propriedade.", criterionGrades: [{criterion: "Conhecimento em Performance (Memo, Lazy, etc.)", grade: 9, justification: "Domina as técnicas."}, {criterion: "Experiência com Ferramentas (Profiler, Lighthouse)", grade: 9, justification: "Cita as ferramentas corretas."}, {criterion: "Aplicação Prática e Exemplos", grade: 9, justification: "Deu exemplos claros de aplicação."}], originalityScore: 8, originalityJustification: "A resposta é bem estruturada e cobre os pontos esperados, mas soa um pouco como um livro-texto. A originalidade é moderada." },
              { question: "Qual a sua abordagem para garantir a qualidade do código em um time? Fale sobre testes, code review e CI/CD.", grade: 9.1, justification: "Demonstra uma abordagem madura e profissional para qualidade.", criterionGrades: [{criterion: "Estratégia de Testes (Unit, Integration, E2E)", grade: 9, justification: "Defende uma boa estratégia."}, {criterion: "Processos de Qualidade (Code Review, Linting)", grade: 10, justification: "Enfatiza a importância da colaboração e automação."}, {criterion: "Conhecimento em CI/CD", grade: 8, justification: "Bom conhecimento, poderia detalhar mais as ferramentas."}], originalityScore: 15, originalityJustification: "A menção a 'no mínimo 2 aprovações' e a citação específica do GitHub Actions adicionam um toque de experiência real." }
            ],
            candidateFeedback: `Foi um prazer conversar e validar seu esforço durante a entrevista. Sua performance foi excelente.

Foi notável como você demonstrou profunda experiência ao descrever a refatoração do monolito para micro-frontends, especialmente na solução para o estado global, o que evidencia sua capacidade de liderança técnica. Sua abordagem para garantir a qualidade do código, detalhando a estratégia de testes e o processo de CI/CD, está muito alinhada com as melhores práticas que valorizamos.

Como sugestão para seu desenvolvimento contínuo, explorar mais a fundo ferramentas de monitoramento de performance em ambiente de produção, como Datadog ou New Relic, pode complementar sua já excelente expertise em otimização e agregar ainda mais valor em projetos futuros.

Reforçamos que seu perfil é muito promissor e agradecemos novamente por sua participação.`
          }
        }
      ],
      status: 'Entrevistando',
      createdAt: "2024-07-20T08:00:00Z"
    },
    // Vaga 2: Gerente de Produto
    {
      id: "vac_172002",
      jobDetails: {
        title: "Gerente de Produto (SaaS)",
        level: "Gerente",
        description: "Estamos à procura de um Gerente de Produto experiente para definir a visão e o roadmap de nosso principal produto SaaS. O candidato será responsável por descobrir oportunidades de mercado, definir requisitos de produtos e trabalhar em estreita colaboração com as equipes de engenharia, design e marketing para entregar soluções que nossos clientes amam.",
        numQuestions: 2,
        bias: 3
      },
      questions: [
        {
          type: 'behavioral',
          question: "Descreva uma situação em que você usou dados quantitativos e qualitativos para tomar uma decisão de produto difícil que foi contra a opinião popular interna. Como você comunicou sua decisão?",
          criteria: [
            { text: "Tomada de Decisão Baseada em Dados", points: 5 },
            { text: "Comunicação e Influência de Stakeholders", points: 3 },
            { text: "Coragem e Convicção", points: 2 }
          ],
          baselineAnswer: "Em uma empresa anterior, a equipe de vendas pressionava por um recurso complexo que, segundo eles, fecharia grandes contratos. No entanto, a análise de dados de uso mostrava que os usuários raramente usavam funcionalidades semelhantes, e entrevistas com clientes revelaram que a principal dor era a complexidade da interface atual. Decidi priorizar uma grande simplificação do fluxo principal em vez do novo recurso. Comuniquei a decisão em uma apresentação para toda a empresa, mostrando os dados quantitativos de uso, trechos de entrevistas com clientes e uma projeção do impacto na retenção de usuários. Embora inicialmente controversa, a decisão levou a um aumento de 15% no engajamento e foi elogiada pelos clientes."
        },
        {
          type: 'behavioral',
          question: "Como você lida com o trade-off entre construir a 'coisa certa' (resolver o problema do usuário) e construir a 'coisa rápido' (entregar valor rapidamente)? Dê um exemplo.",
          criteria: [
            { text: "Priorização e Foco em MVP", points: 5 },
            { text: "Pensamento Estratégico vs. Tático", points: 3 },
            { text: "Gerenciamento de Expectativas", points: 2 }
          ],
          baselineAnswer: "Eu equilibro esse trade-off focando em um MVP (Produto Mínimo Viável) que entregue o máximo de aprendizado com o mínimo de esforço. Por exemplo, queríamos construir um novo módulo de relatórios completo. Em vez de passar meses desenvolvendo, lançamos uma versão inicial que apenas permitia exportar os dados brutos como CSV. Isso resolveu a necessidade mais imediata do usuário (acesso aos dados) e nos deu tempo para coletar feedback sobre quais relatórios pré-construídos seriam mais valiosos, garantindo que construiríamos a 'coisa certa' de forma iterativa."
        }
      ],
      candidates: [
        {
          id: "cand_002",
          candidateName: "Carlos Silva",
          interviewDate: "2024-07-21T14:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva uma situação em que você usou dados quantitativos e qualitativos para tomar uma decisão de produto difícil que foi contra a opinião popular interna. Como você comunicou sua decisão?", answer: "Para tomar uma decisão de produto difícil contra a opinião popular interna, eu me basearia em uma análise aprofundada de dados quantitativos e qualitativos. Por exemplo, se a equipe interna quisesse adicionar um recurso complexo, eu analisaria dados de uso para ver se funcionalidades similares são utilizadas e conduziria entrevistas com usuários para entender suas reais necessidades. Eu comunicaria minha decisão de forma clara e transparente, apresentando os dados que embasaram minha escolha e mostrando como a alternativa priorizada traria mais valor ao cliente e ao negócio a longo prazo." },
            { question: "Como você lida com o trade-off entre construir a 'coisa certa' (resolver o problema do usuário) e construir a 'coisa rápido' (entregar valor rapidamente)? Dê um exemplo.", answer: "Lidar com o trade-off entre construir a 'coisa certa' e a 'coisa rápido' é central para a gestão de produtos. A melhor abordagem é focar em entregas incrementais de valor através de um MVP. Um exemplo seria, em vez de construir um sistema de personalização completo, começar com uma versão simples que oferece algumas opções básicas. Isso permite entregar valor rapidamente, aprender com o uso real e iterar para construir a solução completa de forma mais assertiva, garantindo que estamos construindo a 'coisa certa' ao longo do tempo." }
          ],
          evaluation: {
            globalGrade: 7.5,
            summary: "O candidato demonstra um bom entendimento teórico dos conceitos de gestão de produtos, mas as respostas são genéricas e carecem de exemplos específicos de experiências vividas. A comunicação é clara, mas falta profundidade e a demonstração de aplicação prática dos conceitos.",
            strengths: "- Bom conhecimento teórico de frameworks de produto.\n- Comunicação clara e estruturada.",
            areasForImprovement: "- Fornecer exemplos concretos e detalhados de sua experiência.\n- Demonstrar maior profundidade na análise dos problemas.",
            questionGrades: [
              { question: "Descreva uma situação em que você usou dados quantitativos e qualitativos para tomar uma decisão de produto difícil que foi contra a opinião popular interna. Como você comunicou sua decisão?", grade: 7.0, justification: "A resposta é conceitualmente correta, mas não descreve uma situação real. É uma resposta hipotética que explica 'como faria' em vez de 'como fez'.", criterionGrades: [{criterion: "Tomada de Decisão Baseada em Dados", grade: 7, justification: "Entende o conceito, mas não demonstra aplicação."}, {criterion: "Comunicação e Influência de Stakeholders", grade: 7, justification: "Descreve uma boa abordagem teórica."}, {criterion: "Coragem e Convicção", grade: 6, justification: "Não há como avaliar a coragem sem um exemplo real."}], originalityScore: 85, originalityJustification: "A resposta é genérica e estruturada de forma muito semelhante a uma resposta de livro-texto ou gerada por IA. Falta a especificidade e os detalhes 'confusos' de uma experiência real." },
              { question: "Como você lida com o trade-off entre construir a 'coisa certa' (resolver o problema do usuário) e construir a 'coisa rápido' (entregar valor rapidamente)? Dê um exemplo.", grade: 8.0, justification: "Uma boa explicação do conceito de MVP, mas o exemplo fornecido é muito simples e parece mais um exemplo de livro do que uma experiência de trabalho real.", criterionGrades: [{criterion: "Priorização e Foco em MVP", grade: 8, justification: "Explica bem o conceito de MVP."}, {criterion: "Pensamento Estratégico vs. Tático", grade: 7, justification: "A resposta é mais tática do que estratégica."}, {criterion: "Gerenciamento de Expectativas", grade: 8, justification: "A abordagem descrita é boa para gerenciar expectativas."}], originalityScore: 92, originalityJustification: "A estrutura da resposta e o exemplo usado são extremamente comuns em guias de preparação para entrevistas e respostas geradas por IA, indicando uma alta probabilidade de não ser original." }
            ],
            candidateFeedback: `Agradecemos pelo seu tempo e pela conversa. Reconhecemos seu esforço e a clareza na comunicação.

Sua capacidade de articular conceitos de gestão de produto, como a abordagem de MVP para equilibrar entregas de curto e longo prazo, foi um ponto positivo. Você demonstra ter uma base teórica sólida sobre o tema.

Como sugestão para seu desenvolvimento, recomendamos focar em ilustrar esses conceitos com exemplos mais concretos de suas experiências passadas. Descrever um desafio real que você enfrentou, as ações específicas que tomou e os resultados que alcançou pode demonstrar de forma ainda mais eficaz a aplicação prática de suas habilidades. A utilização do método STAR (Situação, Tarefa, Ação, Resultado) pode ajudar a estruturar essas narrativas.

Reforçamos o seu potencial e desejamos sucesso em sua jornada profissional.`
          }
        }
      ],
      status: 'Pausado',
      createdAt: "2024-07-21T09:00:00Z"
    },
    // Vaga 3: Designer de Produto (UI/UX) Pleno
    {
      id: "vac_172003",
      jobDetails: {
        title: "Designer de Produto (UI/UX) Pleno",
        level: "Especialista",
        description: "Buscamos um Designer de Produto Pleno para criar experiências de usuário intuitivas e visualmente atraentes. Você será responsável por todo o processo de design, desde a pesquisa e conceituação até a prototipagem de alta fidelidade e colaboração com a equipe de desenvolvimento para garantir a implementação perfeita.",
        numQuestions: 3,
        bias: 2
      },
      questions: [
        {
          type: 'behavioral',
          question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?",
          criteria: [
            { text: "Abordagem de Pesquisa com Usuário", points: 4 },
            { text: "Processo de Design e Tomada de Decisão", points: 4 },
            { text: "Mensuração de Resultados e Impacto", points: 2 }
          ],
          baselineAnswer: "Redesenhei o fluxo de checkout de um e-commerce. O problema era uma alta taxa de abandono de carrinho, confirmada pelo Analytics. A pesquisa qualitativa, através de testes de usabilidade, revelou que os usuários se sentiam inseguros com a falta de clareza sobre os custos de frete e a quantidade de etapas. O processo de redesenho envolveu a criação de um fluxo de passo a passo claro, exibindo o custo do frete logo no início. Após o lançamento, a taxa de abandono de carrinho diminuiu em 20% e o tempo médio para concluir a compra foi reduzido em 35 segundos."
        },
        {
          type: 'behavioral',
          question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.",
          criteria: [
            { text: "Pensamento Sistêmico (Usuário, Negócio, Téc.)", points: 5 },
            { text: "Colaboração e Negociação", points: 3 },
            { text: "Pragmatismo e Soluções Criativas", points: 2 }
          ],
          baselineAnswer: "Eu equilibro essas três esferas através da colaboração constante. Por exemplo, queríamos criar um dashboard personalizável (necessidade do usuário), mas a equipe de engenharia informou que a implementação completa levaria 3 meses (restrição técnica). O objetivo do negócio era aumentar o engajamento rapidamente. Minha solução foi projetar uma 'Fase 1' que não permitia personalização total, mas oferecia 3 layouts pré-definidos baseados nos casos de uso mais comuns. Isso atendeu à necessidade básica do usuário, alcançou o objetivo de negócio de forma rápida e foi tecnicamente viável, enquanto planejávamos a personalização completa para um roadmap futuro."
        },
        {
          type: 'behavioral',
          question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?",
          criteria: [
            { text: "Entendimento dos Benefícios (Consistência, Eficiência)", points: 4 },
            { text: "Experiência Prática (Criação ou Uso)", points: 4 },
            { text: "Visão de Escalabilidade", points: 2 }
          ],
          baselineAnswer: "Um Design System é crucial para garantir consistência e escalabilidade, além de acelerar o desenvolvimento. Em meu último projeto, ajudei a construir nosso DS do zero. Fui responsável por documentar os componentes de formulário, definindo seus estados (padrão, erro, desabilitado) e diretrizes de uso. Ao utilizá-lo, conseguíamos prototipar novas telas 50% mais rápido e reduzimos drasticamente as inconsistências visuais que eram comuns antes de sua implementação."
        }
      ],
      candidates: [
        {
          id: "cand_003",
          candidateName: "Juliana Costa",
          interviewDate: "2024-07-22T11:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?", answer: "Claro. Redesenhei a tela de gerenciamento de tarefas de um app. O problema era que os usuários achavam confuso priorizar tarefas. Conduzi testes de usabilidade e usei Hotjar para ver onde eles travavam. A solução foi criar um sistema de 'arrastar e soltar' e adicionar filtros claros. O resultado foi um aumento de 40% na utilização da funcionalidade e uma redução no tempo de organização das tarefas." },
            { question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.", answer: "Vejo isso como uma negociação constante. Em um projeto, o negócio queria lançar um recurso em 1 mês. Os usuários precisavam de uma solução robusta. A engenharia disse que era impossível. Facilitei uma sessão de brainstorming e chegamos a um MVP que entregava o valor central para o usuário e era viável. Lançamos em 5 semanas e iteramos depois." },
            { question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?", answer: "É fundamental. Garante consistência e agilidade. Em meu último trabalho, eu fui uma das principais mantenedoras do nosso Design System no Figma. Documentei novos componentes, promovi seu uso entre os times e ajudei a criar um processo de governança para atualizá-lo." }
          ],
          evaluation: {
            globalGrade: 9.0,
            summary: "Candidata muito forte, com excelentes habilidades de comunicação e um processo de design centrado no usuário bem definido. Demonstra pragmatismo e foco em resultados.",
            strengths: "- Forte orientação para pesquisa e dados.\n- Habilidade de negociação e colaboração com stakeholders.\n- Experiência prática e estratégica com Design Systems.",
            areasForImprovement: "- Poderia quantificar um pouco mais os resultados de negócio em seus exemplos.",
            questionGrades: [
              { question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?", grade: 9, justification: "Excelente resposta, conectando claramente o problema, a pesquisa e os resultados mensuráveis.", criterionGrades: [{criterion: "Abordagem de Pesquisa com Usuário", grade: 9, justification: "Ótima aplicação de métodos qualitativos."}, {criterion: "Processo de Design e Tomada de Decisão", grade: 9, justification: "Processo claro e bem definido."}, {criterion: "Mensuração de Resultados e Impacto", grade: 8, justification: "Resultados de usabilidade claros."}], originalityScore: 10, originalityJustification: "Detalhes específicos como 'Hotjar' e a métrica de '40% de aumento na utilização' indicam uma experiência genuína." },
              { question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.", grade: 9, justification: "Ótimo exemplo de pragmatismo e facilitação, demonstrando uma habilidade chave para a função.", criterionGrades: [{criterion: "Pensamento Sistêmico (Usuário, Negócio, Téc.)", grade: 9, justification: "Demonstra excelente entendimento do equilíbrio."}, {criterion: "Colaboração e Negociação", grade: 10, justification: "A facilitação da sessão é um exemplo perfeito."}, {criterion: "Pragmatismo e Soluções Criativas", grade: 9, justification: "A solução de MVP foi inteligente."}], originalityScore: 12, originalityJustification: "O relato de uma sessão de brainstorming e a negociação de prazos soam como uma situação de trabalho real e detalhada." },
              { question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?", grade: 9, justification: "Mostra não apenas o uso, mas a contribuição ativa para um DS, o que é um grande diferencial.", criterionGrades: [{criterion: "Entendimento dos Benefícios (Consistência, Eficiência)", grade: 9, justification: "Entende profundamente o valor."}, {criterion: "Experiência Prática (Criação ou Uso)", grade: 10, justification: "Experiência como mantenedora é um diferencial."}, {criterion: "Visão de Escalabilidade", grade: 8, justification: "Demonstra visão de governança."}], originalityScore: 7, originalityJustification: "A menção de ser 'mantenedora', documentar componentes e criar 'governança' são detalhes específicos que fogem de respostas genéricas." }
            ],
            candidateFeedback: "Agradecemos a sua participação na entrevista. Sua performance foi excelente e demonstrou grande alinhamento com o que buscamos.\n\nFicou claro sua forte orientação para pesquisa com o usuário, como no exemplo do redesenho da funcionalidade de tarefas, onde você conectou claramente o problema a uma solução eficaz e mensurável. Sua habilidade em facilitar discussões para equilibrar as necessidades de negócio, usuário e tecnologia é um grande diferencial.\n\nComo uma pequena sugestão, ao apresentar seus cases, tente sempre que possível conectar os resultados de usabilidade (como a redução de tempo na tarefa) a métricas de negócio mais amplas (como aumento de retenção ou produtividade). Isso pode fortalecer ainda mais o impacto do seu trabalho.\n\nSeu potencial é evidente e agradecemos novamente pelo seu tempo."
          }
        },
        {
          id: "cand_004",
          candidateName: "Marcos Lima",
          interviewDate: "2024-07-22T15:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?", answer: "Tive que redesenhar um formulário de cadastro que era muito longo. Os usuários reclamavam. Fizemos alguns testes de usabilidade para entender os campos que poderiam ser removidos ou adiados. O novo formulário ficou mais curto e a conversão melhorou." },
            { question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.", answer: "É importante ouvir todos os lados. Eu converso com os PMs para entender os objetivos e com os desenvolvedores para saber o que é possível. Depois, tento encontrar uma solução que atenda um pouco de cada um." },
            { question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?", answer: "Sim, é muito importante para a consistência. Eu usei o Design System da minha empresa anterior. Ele ajudava a gente a não ter que criar componentes do zero toda vez. Facilitava bastante o trabalho." }
          ],
          evaluation: {
            globalGrade: 6.5,
            summary: "O candidato tem um entendimento básico dos processos de UX, mas as respostas são superficiais e carecem de profundidade e detalhes. A comunicação é clara, mas ele não demonstra proatividade ou pensamento estratégico.",
            strengths: "- Entende a importância da pesquisa com o usuário.\n- Comunica-se de forma direta.",
            areasForImprovement: "- Aprofundar nos detalhes dos projetos, explicando o 'porquê' das decisões.\n- Quantificar os resultados de suas ações.\n- Demonstrar mais proatividade em vez de uma postura reativa.",
            questionGrades: [
              { question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?", grade: 6, justification: "A resposta é muito superficial. Ele menciona que a 'conversão melhorou', mas não diz quanto, nem como mediu.", criterionGrades: [], originalityScore: 25, originalityJustification: "A resposta é genérica, mas a simplicidade e falta de detalhes não sugerem o uso de IA, apenas uma falta de preparação ou profundidade." },
              { question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.", grade: 6, justification: "A resposta é uma descrição teórica e não apresenta um exemplo prático como solicitado.", criterionGrades: [], originalityScore: 40, originalityJustification: "A estrutura da resposta ('ouvir todos os lados', 'conversar com PMs') é um clichê comum em design de produto, soando um tanto ensaiado." },
              { question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?", grade: 7, justification: "Descreve corretamente o benefício do DS, mas sua experiência parece ser apenas como um consumidor, não como um contribuidor.", criterionGrades: [], originalityScore: 30, originalityJustification: "A resposta é simples e direta. Não parece ter sido gerada por IA, mas sim reflete uma experiência de nível de usuário." }
            ],
            candidateFeedback: "Obrigado por dedicar seu tempo à entrevista. Valorizamos a oportunidade de conhecer mais sobre sua trajetória.\n\nFoi positivo ouvir sobre sua experiência com o redesenho do formulário de cadastro, onde você aplicou testes de usabilidade para guiar suas decisões. Isso mostra que você entende a importância de ouvir o usuário.\n\nComo uma oportunidade de crescimento, sugerimos aprofundar mais nos detalhes ao descrever seus projetos. Tente explicar não apenas 'o que' você fez, mas também 'por que' tomou certas decisões e, crucialmente, 'qual foi o impacto' mensurável disso. Por exemplo, ao invés de dizer que 'a conversão melhorou', tente apresentar os números: 'a conversão aumentou de 5% para 8%'. Isso tornará suas realizações mais concretas e poderosas.\n\nDesejamos sucesso em sua carreira e agradecemos sua participação."
          }
        },
        {
          id: "cand_005",
          candidateName: "Beatriz Almeida",
          interviewDate: "2024-07-23T09:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?", answer: "Ah, sim. Uma vez mudei as cores de um botão porque os usuários não gostavam da cor antiga. Fiz uma pesquisa e a nova cor foi mais aceita." },
            { question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.", answer: "Eu tento fazer o que o gerente de produto pede, mas também dou a minha opinião de designer. É um equilíbrio difícil." },
            { question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?", answer: "Nunca trabalhei em uma empresa que tivesse um Design System de verdade. Mas acho que seria legal para deixar tudo padronizado." }
          ],
          evaluation: {
            globalGrade: 3.0,
            summary: "A candidata não demonstrou a profundidade e a experiência necessárias para uma posição de nível Pleno. As respostas foram extremamente superficiais, sem detalhar processos, métodos ou resultados.",
            strengths: "- N/A",
            areasForImprovement: "- Falta de conhecimento sobre processos básicos de UX (pesquisa, métricas).\n- Ausência de experiência com ferramentas e conceitos essenciais (Design System).\n- Dificuldade em articular o valor do design para o negócio.",
            questionGrades: [
              { question: "Descreva um projeto em que você teve que redesenhar uma funcionalidade existente com base no feedback dos usuários. Qual era o problema, como você abordou a pesquisa e quais foram os resultados do redesenho?", grade: 3, justification: "A resposta é trivial e não descreve um processo de design. Mudar a cor de um botão não constitui um projeto de redesenho.", criterionGrades: [], originalityScore: 5, originalityJustification: "A resposta é original em sua simplicidade e falta de conteúdo, não mostrando sinais de ter sido gerada artificialmente." },
              { question: "Como você equilibra as necessidades do usuário, os objetivos do negócio e as restrições técnicas em seu trabalho de design? Dê um exemplo prático.", grade: 3, justification: "Não respondeu à pergunta de forma eficaz e não forneceu um exemplo.", criterionGrades: [], originalityScore: 6, originalityJustification: "Resposta curta e evasiva, claramente não gerada por uma IA que tentaria ser mais completa." },
              { question: "Fale sobre a importância de um Design System. Como você contribuiu para ou utilizou um em projetos anteriores?", grade: 3, justification: "A candidata admitiu não ter experiência com o conceito, que é fundamental para a vaga.", criterionGrades: [], originalityScore: 4, originalityJustification: "A honestidade sobre a falta de experiência é uma resposta humana e não se assemelha a conteúdo gerado por IA." }
            ],
            candidateFeedback: "Agradecemos o seu interesse na vaga e o tempo que você dedicou à entrevista.\n\nReconhecemos sua disposição em participar do processo e compartilhar um pouco sobre suas experiências.\n\nCom base em nossa conversa, identificamos que para a posição de Designer de Produto Pleno, buscamos um conhecimento mais aprofundado em áreas como pesquisa com usuários, análise de métricas e experiência com Design Systems. Como sugestão para seu desenvolvimento profissional, recomendamos buscar cursos ou projetos práticos que permitam aprofundar nesses temas, que são fundamentais para o crescimento na carreira de UX/UI Design.\n\nDesejamos sucesso em sua busca por novas oportunidades."
          }
        }
      ],
      status: 'Entrevistando',
      createdAt: "2024-07-22T08:00:00Z"
    },
     // Vaga 4: Analista de Dados Júnior
    {
      id: "vac_172004",
      jobDetails: {
        title: "Analista de Dados Júnior",
        level: "Analista",
        description: "Procuramos um Analista de Dados Júnior para se juntar à nossa equipe de Business Intelligence. O candidato ideal é apaixonado por dados, possui fortes habilidades analíticas e conhecimento em SQL e Python. Você será responsável por criar dashboards, realizar análises ad-hoc e ajudar a transformar dados em insights acionáveis.",
        numQuestions: 3,
        bias: 0
      },
      questions: [
        {
          type: 'behavioral',
          question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?",
          criteria: [
            { text: "Conhecimento Prático em SQL", points: 5 },
            { text: "Raciocínio Analítico e Estruturado", points: 3 },
            { text: "Clareza na Comunicação Técnica", points: 2 }
          ],
          baselineAnswer: "Em um projeto para a faculdade, analisei um dataset de vendas de uma loja online para responder: 'Quais são as 3 categorias de produtos mais vendidas em cada trimestre?'. Usei SQL com CTEs (Common Table Expressions) para primeiro agregar as vendas por categoria e trimestre. Depois, usei a função de janela `ROW_NUMBER()` particionada por trimestre e ordenada por total de vendas para rankear as categorias. Finalmente, selecionei apenas os resultados onde o rank era menor ou igual a 3."
        },
        {
          type: 'behavioral',
          question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?",
          criteria: [
            { text: "Abordagem Metodológica para Resolução de Problemas", points: 5 },
            { text: "Conhecimento de Métricas de Negócio", points: 3 },
            { text: "Proatividade e Curiosidade", points: 2 }
          ],
          baselineAnswer: "Meu primeiro passo seria segmentar o problema. Eu investigaria se a queda foi uniforme ou concentrada em algum segmento específico. Analisaria a taxa de conversão por: 1) Canal de aquisição (tráfego orgânico, pago, social), 2) Tipo de dispositivo (desktop, mobile), 3) Demografia do usuário (novos vs. recorrentes) e 4) Páginas específicas do funil. Isso me ajudaria a isolar a causa raiz, que poderia ser desde uma campanha de marketing de baixo desempenho até um bug no checkout da versão mobile."
        },
        {
          type: 'behavioral',
          question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?",
          criteria: [
            { text: "Habilidade de Storytelling com Dados", points: 4 },
            { text: "Foco em Insights Acionáveis", points: 4 },
            { text: "Empatia com a Audiência", points: 2 }
          ],
          baselineAnswer: "Eu focaria na história que os dados contam, não nos métodos técnicos. Começaria com o insight principal (o 'e daí?'). Em vez de dizer 'uma regressão logística mostrou...', eu diria 'Descobrimos que clientes que compram o produto X têm 70% mais chance de comprar o produto Y no mês seguinte'. Usaria visualizações simples, como gráficos de barras, e focaria em 2 ou 3 recomendações claras e acionáveis que a equipe de vendas poderia implementar imediatamente."
        }
      ],
      candidates: [
        {
          id: "cand_006",
          candidateName: "Lucas Ferreira",
          interviewDate: "2024-07-24T10:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?", answer: "Sim, no meu TCC, analisei dados de locação de bicicletas para ver quais estações eram mais populares em dias de semana versus fins de semana. Usei uma query com `CASE WHEN` para criar uma coluna 'tipo_dia', depois usei `GROUP BY` e `COUNT` para agregar os dados e `ORDER BY` para rankear as estações em cada grupo." },
            { question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?", answer: "Primeiro, eu tentaria quebrar o problema. Verificaria se a queda veio de algum canal específico, como Google Ads ou Facebook. Depois, olharia por dispositivo, mobile versus desktop. Também analisaria se a queda aconteceu em alguma etapa específica do funil de conversão. Basicamente, segmentar para encontrar a fonte." },
            { question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?", answer: "Eu evitaria jargões técnicos. Focaria no resultado prático. Por exemplo, em vez de falar do modelo, eu diria: 'A análise mostra que se focarmos nos clientes da região Sul, podemos aumentar as vendas em 15%'. Usaria um gráfico de pizza ou de barras bem simples para ilustrar e terminaria com as ações que eles podem tomar." }
          ],
          evaluation: {
            globalGrade: 8.8,
            summary: "Candidato júnior muito promissor. Possui um bom raciocínio analítico, conhecimento técnico sólido para o nível e excelentes habilidades de comunicação.",
            strengths: "- Raciocínio lógico e estruturado para resolver problemas.\n- Bom conhecimento prático de SQL.\n- Habilidade de traduzir dados em insights acionáveis para públicos não-técnicos.",
            areasForImprovement: "- Aprofundar em técnicas estatísticas mais avançadas.",
            questionGrades: [
              { question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?", grade: 9, justification: "Resposta excelente para um júnior. Descreveu um projeto real, a lógica da query e o objetivo de negócio.", criterionGrades: [{criterion: "Conhecimento Prático em SQL", grade: 9, justification: "Demonstrou aplicação prática e lógica correta."}, {criterion: "Raciocínio Analítico e Estruturado", grade: 9, justification: "Abordagem clara para responder à pergunta de negócio."}, {criterion: "Clareza na Comunicação Técnica", grade: 9, justification: "Explicou a query de forma simples."}], originalityScore: 10, originalityJustification: "A especificidade do projeto de TCC com análise de bicicletas soa autêntica e bem articulada." },
              { question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?", grade: 9, justification: "Demonstrou uma abordagem metodológica e estruturada, que é exatamente o que se espera de um bom analista.", criterionGrades: [{criterion: "Abordagem Metodológica para Resolução de Problemas", grade: 9, justification: "A segmentação é a abordagem correta."}, {criterion: "Conhecimento de Métricas de Negócio", grade: 9, justification: "Citou as métricas e dimensões corretas a serem analisadas."}, {criterion: "Proatividade e Curiosidade", grade: 8, justification: "Demonstrou curiosidade em investigar a fundo."}], originalityScore: 15, originalityJustification: "A abordagem de segmentação é padrão, mas a forma como ele a articulou foi clara e direta, parecendo natural." },
              { question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?", grade: 8.5, justification: "Mostrou grande maturidade ao focar em storytelling e ações práticas, uma habilidade rara em perfis júnior.", criterionGrades: [{criterion: "Habilidade de Storytelling com Dados", grade: 8, justification: "Entendeu a necessidade de focar na história."}, {criterion: "Foco em Insights Acionáveis", grade: 9, justification: "A resposta foi totalmente focada em ações."}, {criterion: "Empatia com a Audiência", grade: 9, justification: "Demonstrou empatia ao evitar jargões."}], originalityScore: 12, originalityJustification: "O exemplo prático sobre a 'região Sul' e o foco em ações claras para a equipe de vendas tornam a resposta personalizada e convincente." }
            ],
            candidateFeedback: "Agradecemos a sua participação na entrevista. Ficamos muito satisfeitos com a conversa e seu desempenho.\n\nSua abordagem estruturada para resolver o problema da queda de conversão foi excelente e demonstrou um raciocínio analítico maduro. Também foi notável sua capacidade de comunicar insights complexos de forma simples e acionável, como no exemplo para a equipe de vendas, o que é uma habilidade fundamental para um analista de dados.\n\nComo sugestão para seu contínuo aprendizado, explorar conceitos de testes A/B e estatística inferencial pode adicionar ainda mais profundidade às suas análises e permitir que você valide hipóteses com maior rigor científico.\n\nVocê demonstrou um grande potencial e agradecemos novamente pelo seu tempo."
          }
        },
        {
          id: "cand_007",
          candidateName: "Fernanda Souza",
          interviewDate: "2024-07-24T14:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?", answer: "Eu fiz um curso online onde tínhamos um banco de dados de filmes. Tivemos que usar `JOIN` para juntar a tabela de filmes com a de atores e `WHERE` para filtrar por gênero. O objetivo era listar os atores de filmes de comédia." },
            { question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?", answer: "Eu pediria acesso ao Google Analytics para olhar os gráficos. Veria o gráfico de conversão ao longo do tempo para confirmar a queda e tentaria encontrar alguma correlação com outras métricas, como o número de visitantes." },
            { question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?", answer: "Eu faria uma apresentação em PowerPoint com os principais gráficos e explicaria cada um. Tentaria usar uma linguagem simples para que todos pudessem entender o que os dados estão dizendo." }
          ],
          evaluation: {
            globalGrade: 6.0,
            summary: "A candidata possui conhecimento teórico básico, provavelmente adquirido em cursos, mas carece de experiência prática e de uma abordagem analítica mais proativa. As respostas foram reativas e não demonstraram profundidade.",
            strengths: "- Conhecimento de comandos básicos de SQL.\n- Familiaridade com ferramentas como Google Analytics.",
            areasForImprovement: "- Desenvolver um raciocínio analítico mais estruturado e hipotético.\n- Aprofundar a aplicação prática de suas habilidades técnicas.\n- Focar em transformar dados em insights, não apenas em reportar métricas.",
            questionGrades: [
              { question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?", grade: 6, justification: "A resposta descreve um exercício básico de um curso, não um projeto analítico. Mostra familiaridade com a sintaxe, mas não com a resolução de problemas.", criterionGrades: [{criterion: "Conhecimento Prático em SQL", grade: 6, justification: "Conhece a sintaxe básica."}, {criterion: "Raciocínio Analítico e Estruturado", grade: 5, justification: "Não demonstrou raciocínio analítico."}, {criterion: "Clareza na Comunicação Técnica", grade: 7, justification: "A comunicação foi clara."}], originalityScore: 35, originalityJustification: "O exemplo do banco de dados de filmes é extremamente comum em cursos e tutoriais online, o que levanta dúvidas sobre a originalidade." },
              { question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?", grade: 5, justification: "A abordagem é passiva ('olhar os gráficos'). Falta a proatividade de segmentar e formular hipóteses.", criterionGrades: [{criterion: "Abordagem Metodológica para Resolução de Problemas", grade: 4, justification: "Abordagem muito reativa."}, {criterion: "Conhecimento de Métricas de Negócio", grade: 6, justification: "Mencionou métricas básicas."}, {criterion: "Proatividade e Curiosidade", grade: 4, justification: "Faltou curiosidade investigativa."}], originalityScore: 45, originalityJustification: "A resposta é superficial e se atém a uma ferramenta (Google Analytics) sem descrever um processo de investigação, o que é comum em respostas menos experientes." },
              { question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?", grade: 7, justification: "A resposta é razoável, mas foca muito na ferramenta (PowerPoint) em vez da técnica (storytelling, foco em ações).", criterionGrades: [{criterion: "Habilidade de Storytelling com Dados", grade: 6, justification: "Focou mais em mostrar gráficos do que contar uma história."}, {criterion: "Foco em Insights Acionáveis", grade: 6, justification: "Não mencionou a importância de focar em ações."}, {criterion: "Empatia com a Audiência", grade: 8, justification: "Demonstrou empatia ao querer simplificar."}], originalityScore: 30, originalityJustification: "A resposta é genérica e não oferece um exemplo concreto, mas não exibe os padrões típicos de uma resposta gerada por IA." }
            ],
            candidateFeedback: "Obrigado por sua participação em nosso processo seletivo. Agradecemos o tempo dedicado à entrevista.\n\nSua familiaridade com comandos SQL e ferramentas como o Google Analytics é um bom ponto de partida para a carreira de análise de dados. É positivo que você já tenha tido contato com essas tecnologias.\n\nComo uma sugestão para acelerar seu desenvolvimento, recomendamos focar na aplicação prática desses conhecimentos para resolver problemas de negócio. Ao analisar um problema, como a queda na conversão, tente ir além de observar os dados e pratique a formulação de hipóteses e a segmentação para encontrar a causa raiz. Além disso, ao comunicar resultados, concentre-se menos na apresentação dos gráficos e mais na história que eles contam e nas ações que eles sugerem.\n\nContinue investindo em projetos práticos para solidificar sua experiência. Desejamos sucesso em sua jornada."
          }
        },
        {
          id: "cand_008",
          candidateName: "Rafael Martins",
          interviewDate: "2024-07-25T16:00:00Z",
          checkAnswers: [],
          answers: [
            { question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?", answer: "Eu ainda não tive a oportunidade de fazer um projeto grande com SQL, estou mais no começo dos estudos, mas entendo a lógica de como funciona para buscar informações em um banco de dados." },
            { question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?", answer: "Nossa, que desafio! Eu acho que primeiro eu conversaria com o gerente para entender melhor o que ele acha que pode ter acontecido. Talvez tenha tido algum feriado no mês, ou algo assim." },
            { question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?", answer: "Eu tentaria ser o mais didático possível. Mostraria os números de uma forma que fizesse sentido para eles, talvez comparando com metas ou com o mês anterior. Acho que o mais importante é ter empatia e paciência para explicar." }
          ],
          evaluation: {
            globalGrade: 4.0,
            summary: "O candidato é bem-intencionado e parece ter boas habilidades interpessoais, mas não possui o conhecimento técnico mínimo necessário para a vaga de Analista de Dados Júnior. Demonstrou falta de experiência com SQL e com metodologias de análise.",
            strengths: "- Boa habilidade de comunicação interpessoal.\n- Demonstra empatia e vontade de aprender.",
            areasForImprovement: "- Necessidade de desenvolver habilidades técnicas fundamentais em SQL e análise de dados.\n- Aprender a estruturar uma investigação analítica de forma autônoma.",
            questionGrades: [
              { question: "Descreva um projeto acadêmico ou pessoal em que você utilizou SQL para extrair e manipular dados para responder a uma pergunta. Qual foi a pergunta e como você estruturou sua query?", grade: 2, justification: "O candidato admitiu não ter a experiência prática solicitada, que é um requisito fundamental para a vaga.", criterionGrades: [{criterion: "Conhecimento Prático em SQL", grade: 2, justification: "Admitiu não ter experiência."}, {criterion: "Raciocínio Analítico e Estruturado", grade: 2, justification: "Não pôde demonstrar."}, {criterion: "Clareza na Comunicação Técnica", grade: 5, justification: "Foi honesto sobre sua limitação."}], originalityScore: 3, originalityJustification: "A resposta é uma admissão honesta de falta de experiência, o que é inerentemente original e humano." },
              { question: "Imagine que um gerente de marketing pede para você analisar a queda de 10% na taxa de conversão do site no último mês. Quais seriam os seus primeiros passos para investigar a causa?", grade: 4, justification: "A abordagem do candidato é baseada em conversas e intuição, não em análise de dados. Ele não propôs nenhuma investigação nos dados.", criterionGrades: [{criterion: "Abordagem Metodológica para Resolução de Problemas", grade: 3, justification: "Não demonstrou uma abordagem metodológica."}, {criterion: "Conhecimento de Métricas de Negócio", grade: 4, justification: "Mencionou fatores externos (feriado), mas não métricas internas."}, {criterion: "Proatividade e Curiosidade", grade: 5, justification: "Mostrou curiosidade, mas de forma não-analítica."}], originalityScore: 8, originalityJustification: "A sugestão de perguntar ao gerente ou verificar feriados é uma abordagem de senso comum, não uma resposta técnica, e soa genuína." },
              { question: "Como você comunicaria os resultados de uma análise complexa para uma audiência não-técnica, como a equipe de vendas?", grade: 6, justification: "A resposta foca em soft skills (didática, empatia), que são importantes, mas não aborda as técnicas de comunicação de dados (storytelling, visualização).", criterionGrades: [{criterion: "Habilidade de Storytelling com Dados", grade: 5, justification: "Não demonstrou a habilidade."}, {criterion: "Foco em Insights Acionáveis", grade: 5, justification: "Não mencionou a importância de focar em ações."}, {criterion: "Empatia com a Audiência", grade: 8, justification: "Demonstrou muita empatia."}], originalityScore: 10, originalityJustification: "A ênfase em 'empatia e paciência' é uma perspectiva humana e pessoal, que difere de uma resposta padrão gerada por IA." }
            ],
            candidateFeedback: "Agradecemos sua participação e a conversa agradável que tivemos. Reconhecemos seu entusiasmo e sua excelente habilidade de comunicação.\n\nSua ênfase na empatia e na clareza ao se comunicar com outras equipes é uma qualidade muito valiosa. A vontade de aprender que você demonstrou também é um ponto muito positivo.\n\nPara a vaga de Analista de Dados Júnior, o conhecimento prático em ferramentas como SQL e uma abordagem estruturada para investigar dados são essenciais. Como um caminho para seu desenvolvimento, sugerimos fortemente a realização de cursos práticos e o desenvolvimento de projetos pessoais de análise de dados. Plataformas como Kaggle ou a criação de um portfólio no GitHub podem ser ótimas maneiras de adquirir a experiência técnica necessária para iniciar na área.\n\nDesejamos muito sucesso em seus estudos e em sua carreira."
          }
        }
      ],
      status: 'Fechado',
      createdAt: "2024-07-24T09:00:00Z"
    },
    // Vaga 5: Analista de Growth Sênior
    {
      id: "vac_172005",
      jobDetails: {
        title: "Analista de Growth Sênior",
        level: "Sênior",
        description: `Responsabilidades e atribuições

O que é o nosso time de Principal?

Prestamos assessoria aos clientes de alta renda, por meio de relacionamento de excelência, identificando as necessidades financeiras e oportunidades de novos negócios, valorizando a centralidade do cliente e a principalidade ao maximizar o resultado/rentabilidade com competência, responsabilidade e ética.

Modelo de trabalho : Híbrido - 3x Presencial

Unidade: Faria Lima - SP

Como será seu dia a dia?

Sendo Analista Growth SR, atuará na gerência Growth e suas principais atividades serão:

 Liderar iniciativas de crescimento com foco em dados, testes e rollouts;
 Definir público-alvo, proposta de valor, estratégia comercial e ações de ativação;
 Analisar dados de comportamento de clientes e indicadores de negócio;
 Transformar dados em ações práticas e insights acionáveis;
 Planejar e executar testes A/B e multivariados;
 Realizar retroalimentação contínua do processo com base nos resultados;
 Desenvolver estratégias com base em alavancas de valor;
 Apresentar resultados e recomendações para stakeholders.

Requisitos e Qualificações

O que você precisa ter ou saber?

 Experiência com análise de dados e indicadores;
 Conhecimento de produtos bancários;
 Vivência com metodologias ágeis;
 Vivência em estruturas de Growth.

Será um diferencial se você tiver:

 Experiência com ferramentas de análise de dados e CRM;
 Vivência com desenvolvimento de dashboards e dataviews;
 Inglês.`,
        numQuestions: 3,
        bias: 2,
      },
      questions: [
        {
          type: 'check',
          question: 'Você tem inglês fluente?',
          expectedAnswer: 'yes',
        },
        {
          type: 'check',
          question: 'Você tem capacidade de trabalhar híbrido 3 dias por semana na Faria Lima/SP?',
          expectedAnswer: 'yes',
        },
        {
          type: 'behavioral',
          question: "Conte sobre uma situação em que você liderou uma iniciativa de crescimento. Como você utilizou dados e testes (como A/B ou multivariados) para identificar a oportunidade, planejar a execução e, posteriormente, transformar os resultados em ações práticas e insights acionáveis para o negócio?",
          criteria: [
            { text: 'Habilidade em identificar oportunidades de crescimento baseadas em dados e definir hipóteses claras para testes (A/B ou multivariados).', points: 4 },
            { text: 'Proficiência na execução e análise dos resultados dos testes, extraindo insights relevantes sobre o comportamento do cliente.', points: 3 },
            { text: 'Capacidade de converter insights em planos de ação concretos e demonstrar o impacto mensurável na alavancagem do crescimento.', points: 3 },
          ],
          baselineAnswer: "Liderei uma iniciativa para aumentar a adesão a um novo produto de investimento. A análise inicial mostrou um baixo engajamento no funil de contratação. A hipótese era que a interface estava muito complexa. Planejamos um teste A/B: a versão A era a atual, e a B era uma versão simplificada com menos passos. O resultado mostrou um uplift de 25% na conversão para a versão B. Como ação prática, implementamos a versão B para 100% dos usuários e usamos os insights sobre a preferência por simplicidade para guiar o redesign de outros fluxos do app."
        },
        {
          type: 'behavioral',
          question: "Descreva um projeto onde você precisou analisar dados de comportamento de clientes para definir ou otimizar um público-alvo e uma proposta de valor específica. Como você desenvolveu a estratégia comercial com base nesta análise e apresentou suas descobertas e recomendações para os stakeholders, considerando o contexto de produtos bancários?",
          criteria: [
            { text: 'Profundidade na análise de dados para segmentação de público e formulação de proposta de valor alinhada ao contexto de produtos bancários.', points: 4 },
            { text: 'Raciocínio estratégico na definição de ações de ativação e uma estratégia comercial clara a partir dos insights de dados.', points: 3 },
            { text: 'Efetividade na comunicação e apresentação de resultados e recomendações para stakeholders, articulando o impacto no negócio.', points: 3 },
          ],
          baselineAnswer: "Para otimizar a oferta de crédito pessoal, analisei o comportamento transacional dos clientes. Identifiquei um cluster de clientes com alta renda, mas que não utilizavam nosso produto de crédito, preferindo concorrentes. A proposta de valor foi otimizada para oferecer taxas mais competitivas e um processo de aprovação mais rápido para este segmento. A estratégia comercial incluiu uma campanha de marketing direto via CRM. Apresentei aos stakeholders o tamanho da oportunidade (share-of-wallet), o perfil do público e a projeção de ROI, o que garantiu a aprovação para a iniciativa."
        },
        {
          type: 'behavioral',
          question: "Fale sobre um momento em que você precisou adaptar uma estratégia de crescimento porque os resultados iniciais não foram os esperados. Como você utilizou a retroalimentação contínua do processo e metodologias ágeis para reavaliar, ajustar o plano e desenvolver novas abordagens com base em alavancas de valor?",
          criteria: [
            { text: 'Demonstra vivência com metodologias ágeis para iteração e adaptação de estratégias de crescimento em cenários adversos.', points: 3 },
            { text: 'Habilidade em analisar a retroalimentação dos resultados e identificar alavancas de valor para ajustar a rota e otimizar o desempenho.', points: 4 },
            { text: 'Capacidade de implementar mudanças e demonstrar um processo de aprendizado contínuo que levou a melhorias tangíveis na estratégia.', points: 3 },
          ],
          baselineAnswer: "Lançamos uma campanha para aumentar o uso do home broker, mas a adesão foi baixa. Em uma retrospectiva ágil, analisamos os dados e o feedback qualitativo: os clientes achavam a plataforma intimidante. Em vez de continuar investindo em marketing, a alavanca de valor identificada foi a 'educação'. Pivotamos a estratégia para criar uma série de webinars e tutoriais simples. A cada sprint, lançávamos um novo conteúdo e medíamos o impacto. Essa abordagem iterativa aumentou a confiança do usuário e, consequentemente, o volume de negociações em 30% em três meses."
        }
      ],
      candidates: [
        {
          id: "cand_009",
          candidateName: "Rodrigo Barreto",
          interviewDate: "2024-07-26T11:00:00Z",
          checkAnswers: [
            { question: "Você tem inglês fluente?", answer: "yes" },
            { question: "Você tem capacidade de trabalhar híbrido 3 dias por semana na Faria Lima/SP?", answer: "yes" }
          ],
          answers: [
            { question: "Conte sobre uma situação em que você liderou uma iniciativa de crescimento. Como você utilizou dados e testes (como A/B ou multivariados) para identificar a oportunidade, planejar a execução e, posteriormente, transformar os resultados em ações práticas e insights acionáveis para o negócio?", answer: "Claro. Para aumentar a ativação de novos clientes, analisei o funil e vi que muitos paravam após o cadastro. A hipótese era que o primeiro passo era confuso. Criei um teste A/B com um novo onboarding guiado. A versão B teve 15% mais ativações. O insight foi que precisávamos guiar melhor o usuário. A ação foi implementar o novo onboarding e criar uma régua de comunicação para os primeiros dias." },
            { question: "Descreva um projeto onde você precisou analisar dados de comportamento de clientes para definir ou otimizar um público-alvo e uma proposta de valor específica. Como você desenvolveu a estratégia comercial com base nesta análise e apresentou suas descobertas e recomendações para os stakeholders, considerando o contexto de produtos bancários?", answer: "Analisei a base de clientes de um cartão de crédito e segmentei por padrão de gastos. Identifiquei um público que viajava muito. Otimizamos a proposta de valor oferecendo mais pontos em cias aéreas. A estratégia comercial foi uma campanha via e-mail e app para esse segmento. Apresentei o potencial de aumento de faturamento e o custo da campanha, mostrando um ROI atrativo, e os diretores aprovaram." },
            { question: "Fale sobre um momento em que você precisou adaptar uma estratégia de crescimento porque os resultados iniciais não foram os esperados. Como você utilizou a retroalimentação contínua do processo e metodologias ágeis para reavaliar, ajustar o plano e desenvolver novas abordagens com base em alavancas de valor?", answer: "Lançamos uma funcionalidade de cashback, mas a adesão foi baixa. Nas dailies e retros, vimos pelos dados que o benefício não estava claro. A alavanca era a comunicação. Em vez de insistir, fizemos um sprint para criar banners e tutoriais dentro do app explicando como funcionava. Medimos o acesso aos tutoriais e a adesão, que começou a crescer. Foi um aprendizado rápido." }
          ],
          evaluation: {
            globalGrade: 9.1,
            summary: "Candidato sênior com vasta experiência prática em Growth. Demonstra forte habilidade analítica, pensamento estruturado e foco em resultados. Comunica-se de forma clara e objetiva, conectando as ações aos impactos de negócio.",
            strengths: "- Liderança de iniciativas de crescimento com base em dados.\n- Proficiência em testes A/B e análise de funil.\n- Mentalidade ágil e adaptativa para otimizar estratégias.",
            areasForImprovement: "- Poderia detalhar mais as ferramentas específicas utilizadas nas análises.",
            questionGrades: [],
            candidateFeedback: "Agradecemos sua participação em nosso processo seletivo. Sua performance foi impressionante e demonstrou grande alinhamento com as competências que buscamos para a posição de Analista de Growth Sênior.\n\nSua capacidade de liderar iniciativas de ponta a ponta, desde a análise de dados e formulação de hipóteses até a execução de testes e implementação de melhorias, ficou evidente em seus exemplos. A forma como você articula o aprendizado e adapta estratégias, como no caso da funcionalidade de cashback, mostra uma mentalidade ágil e focada em resultados que valorizamos muito.\n\nSeu perfil é extremamente aderente à vaga e entraremos em contato em breve para os próximos passos."
          }
        },
        {
          id: "cand_010",
          candidateName: "Vanessa Moraes",
          interviewDate: "2024-07-26T15:00:00Z",
          checkAnswers: [
            { question: "Você tem inglês fluente?", answer: "no" },
            { question: "Você tem capacidade de trabalhar híbrido 3 dias por semana na Faria Lima/SP?", answer: "yes" }
          ],
          answers: [
            { question: "Conte sobre uma situação em que você liderou uma iniciativa de crescimento. Como você utilizou dados e testes (como A/B ou multivariados) para identificar a oportunidade, planejar a execução e, posteriormente, transformar os resultados em ações práticas e insights acionáveis para o negócio?", answer: "Eu sempre uso dados para tomar decisões. Em uma iniciativa, olhei os relatórios e vi uma oportunidade de crescimento. Propus uma mudança e acompanhei os resultados para ver se funcionava. O importante é sempre medir para saber se deu certo." },
            { question: "Descreva um projeto onde você precisou analisar dados de comportamento de clientes para definir ou otimizar um público-alvo e uma proposta de valor específica. Como você desenvolveu a estratégia comercial com base nesta análise e apresentou suas descobertas e recomendações para os stakeholders, considerando o contexto de produtos bancários?", answer: "Analisar o comportamento dos clientes é chave. Eu olharia o CRM para entender quem são nossos melhores clientes e tentaria focar as ações neles. Depois, montaria uma apresentação com gráficos para mostrar para a diretoria por que deveríamos focar nesse público." },
            { question: "Fale sobre um momento em que você precisou adaptar uma estratégia de crescimento porque os resultados iniciais não foram os esperados. Como você utilizou a retroalimentação contínua do processo e metodologias ágeis para reavaliar, ajustar o plano e desenvolver novas abordagens com base em alavancas de valor?", answer: "Sim, isso acontece. Quando uma estratégia não funciona, temos que ser ágeis e mudar. Eu reuniria a equipe para discutir o que deu errado e pensar em novas ideias. É um processo de tentativa e erro, e o importante é aprender com os erros e tentar de novo." }
          ],
          evaluation: {
            globalGrade: 6.2,
            summary: "A candidata entende os conceitos de Growth em um nível teórico, mas as respostas são genéricas e não demonstram a profundidade ou a experiência prática esperada para um cargo sênior. Falta detalhamento sobre o 'como' as ações foram executadas e os resultados específicos alcançados.",
            strengths: "- Boa compreensão teórica dos princípios de Growth.\n- Comunicação clara.",
            areasForImprovement: "- Falta de exemplos concretos e detalhados.\n- Demonstrar maior profundidade na aplicação de metodologias e análises.\n- Articular o impacto mensurável de suas ações.",
            questionGrades: [],
            candidateFeedback: "Obrigado por seu tempo e por participar de nossa entrevista. Valorizamos a oportunidade de conhecer mais sobre você.\n\nSua familiaridade com os conceitos de análise de dados e agilidade é um bom ponto de partida. Você demonstrou entender a importância de medir resultados e adaptar estratégias.\n\nPara uma posição sênior, buscamos uma capacidade mais aprofundada de detalhar experiências passadas, explicando não apenas 'o que' foi feito, mas especificamente 'como' foi feito e 'quais foram os resultados numéricos'. Como sugestão para seu desenvolvimento, pratique estruturar suas respostas usando o método STAR (Situação, Tarefa, Ação, Resultado) para articular suas realizações de forma mais impactante.\n\nDesejamos sucesso em sua jornada profissional."
          }
        }
      ],
      status: 'Entrevistando',
      createdAt: '2024-07-26T09:00:00Z',
    }
  ];
};