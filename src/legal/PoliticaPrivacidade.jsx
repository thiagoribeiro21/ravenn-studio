import LegalPage, { H3, P, UL } from './LegalPage';

const LAST_UPDATED = '17 de agosto de 2026';

const sections = [
  {
    id: 'introducao',
    heading: 'Introdução',
    body: (
      <>
        <P>
          A Ravenn Studio ("Ravenn Studio", "nós") respeita a privacidade de quem visita nosso site e entra em
          contato com a nossa equipe. Esta Política de Privacidade explica, de forma clara, quais dados
          coletamos, por que coletamos, como usamos, com quem podemos compartilhar e quais direitos você tem
          sobre eles, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)
          e demais legislações aplicáveis.
        </P>
        <P>
          Esta política vale para o site institucional (ravennstudio.com.br) e para todas as landing pages
          publicadas em campanhas de anúncios (Google Ads, Meta Ads) que levam de volta a este domínio ou a
          subdomínios controlados pela Ravenn Studio.
        </P>
        <P>
          Ao navegar em nosso site ou enviar seus dados por qualquer canal (formulário, WhatsApp, e-mail),
          você declara estar ciente das práticas aqui descritas.
        </P>
      </>
    ),
  },
  {
    id: 'dados-coletados',
    heading: 'Quais dados coletamos',
    body: (
      <>
        <H3>Dados fornecidos voluntariamente por você</H3>
        <UL
          items={[
            'Nome completo',
            'Número de telefone / WhatsApp',
            'E-mail',
            'Nome da empresa ou negócio, quando informado',
            'Conteúdo das mensagens trocadas em formulários, WhatsApp ou e-mail',
          ]}
        />
        <H3>Dados coletados automaticamente durante a navegação</H3>
        <UL
          items={[
            'Endereço IP e localização geográfica aproximada',
            'Tipo de dispositivo, sistema operacional e navegador',
            'Páginas visitadas, tempo de permanência e caminho de navegação dentro do site',
            'Origem do acesso (site de referência, redes sociais, busca orgânica)',
            'Parâmetros de campanha (UTM) e identificadores de clique de anúncios (ex.: gclid, fbclid), quando você chega ao site a partir de um anúncio pago',
          ]}
        />
        <H3>Dados de cookies e tecnologias similares</H3>
        <P>Ver a seção "Cookies e tecnologias de rastreamento" abaixo para o detalhamento completo.</P>
      </>
    ),
  },
  {
    id: 'como-coletamos',
    heading: 'Como coletamos seus dados',
    body: (
      <UL
        items={[
          'Diretamente, quando você preenche um formulário de contato ou orçamento em nosso site;',
          'Diretamente, quando você inicia uma conversa pelo botão de WhatsApp presente no site;',
          'Diretamente, quando você nos envia um e-mail;',
          'Automaticamente, por meio de cookies e ferramentas de análise (como Google Analytics e Google Tag Manager) durante a sua navegação;',
          'Automaticamente, por meio de pixels de rastreamento de plataformas de anúncio (Google Ads e Meta Ads), quando aplicável a cada campanha em andamento.',
        ]}
      />
    ),
  },
  {
    id: 'finalidade',
    heading: 'Para que usamos seus dados',
    body: (
      <UL
        items={[
          'Responder às suas solicitações de contato, dúvidas e pedidos de orçamento;',
          'Elaborar propostas comerciais e apresentar nossos serviços;',
          'Prestar os serviços contratados, quando há uma relação comercial formalizada;',
          'Melhorar a experiência de navegação, o desempenho e o conteúdo do site;',
          'Medir a eficiência de campanhas de marketing e anúncios (Google Ads, Meta Ads) e otimizar seu custo de aquisição;',
          'Exibir remarketing — anúncios da Ravenn Studio para quem já visitou o site, em outras plataformas;',
          'Cumprir obrigações legais e regulatórias, quando exigido.',
        ]}
      />
    ),
  },
  {
    id: 'base-legal',
    heading: 'Base legal para o tratamento',
    body: (
      <>
        <P>Tratamos seus dados pessoais com base nas seguintes hipóteses legais previstas no art. 7º da LGPD:</P>
        <UL
          items={[
            <>
              <strong className="text-rv-titanium">Consentimento</strong> — quando você preenche um formulário
              ou inicia contato voluntariamente, fornecendo seus dados para um propósito específico;
            </>,
            <>
              <strong className="text-rv-titanium">Execução de contrato</strong> — quando os dados são
              necessários para elaborar uma proposta ou prestar um serviço já contratado;
            </>,
            <>
              <strong className="text-rv-titanium">Legítimo interesse</strong> — para análise de navegação,
              melhoria do site e medição de campanhas de marketing, sempre de forma proporcional e sem prejuízo
              aos seus direitos e liberdades fundamentais;
            </>,
            <>
              <strong className="text-rv-titanium">Cumprimento de obrigação legal ou regulatória</strong>,
              quando aplicável.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'cookies',
    heading: 'Cookies e tecnologias de rastreamento',
    body: (
      <>
        <P>
          Cookies são pequenos arquivos de texto armazenados no seu navegador que permitem ao site reconhecer
          seu dispositivo e lembrar informações sobre sua visita. Utilizamos as seguintes categorias:
        </P>
        <UL
          items={[
            <>
              <strong className="text-rv-titanium">Necessários</strong> — essenciais para o funcionamento
              básico do site (ex.: preferências de exibição). Não podem ser desativados sem afetar o
              funcionamento da página.
            </>,
            <>
              <strong className="text-rv-titanium">Analíticos / desempenho</strong> — como os do Google
              Analytics, usados para entender como o site é utilizado (páginas visitadas, tempo de permanência,
              origem do tráfego) e melhorá-lo com base nesses dados.
            </>,
            <>
              <strong className="text-rv-titanium">Publicitários / remarketing</strong> — como os pixels do
              Google Ads e do Meta Ads (Facebook/Instagram), usados para medir a performance de campanhas e
              exibir anúncios relevantes para quem já visitou o site.
            </>,
          ]}
        />
        <P>
          Você pode gerenciar, bloquear ou excluir cookies diretamente nas configurações do seu navegador. A
          desativação de cookies não essenciais não impede a navegação, mas pode limitar algumas
          funcionalidades e a personalização da sua experiência. Cada navegador tem seu próprio processo —
          consulte o menu de "Privacidade" ou "Configurações de site" do navegador que você utiliza.
        </P>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    heading: 'Com quem compartilhamos seus dados',
    body: (
      <>
        <P>
          A Ravenn Studio <strong className="text-rv-titanium">não vende</strong> seus dados pessoais a
          terceiros. Compartilhamos dados apenas com prestadores de serviço que nos ajudam a operar o site e a
          conduzir nossas atividades, sempre na medida necessária para a finalidade em questão:
        </P>
        <UL
          items={[
            'Provedores de hospedagem e infraestrutura de tecnologia;',
            'Google (Google Analytics, Google Tag Manager, Google Ads), para análise de tráfego e gestão de campanhas;',
            'Meta (Meta Ads / Facebook e Instagram), para gestão de campanhas publicitárias, quando aplicável;',
            'WhatsApp / Meta Business, como canal de atendimento direto quando você opta por essa via de contato;',
            'Ferramentas de e-mail e agenda, para responder solicitações e agendar reuniões;',
            'Autoridades públicas, mediante requisição legal, quando exigido por lei ou ordem judicial.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'transferencia-internacional',
    heading: 'Transferência internacional de dados',
    body: (
      <P>
        Algumas das ferramentas que utilizamos (como Google e Meta) podem armazenar e processar dados em
        servidores localizados fora do Brasil. Nesses casos, buscamos utilizar apenas fornecedores que adotam
        padrões internacionais de proteção de dados e cláusulas contratuais compatíveis com a LGPD, conforme
        previsto no art. 33 da lei.
      </P>
    ),
  },
  {
    id: 'retencao',
    heading: 'Armazenamento e retenção',
    body: (
      <P>
        Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta
        política, para atender obrigações legais, contratuais ou regulatórias, ou até que você solicite sua
        eliminação — o que ocorrer primeiro, ressalvadas as hipóteses de guarda obrigatória previstas em lei.
        Dados de contato de propostas não convertidas em contrato são mantidos por um prazo razoável para
        eventual retomada do contato, podendo ser excluídos a qualquer momento mediante solicitação.
      </P>
    ),
  },
  {
    id: 'seguranca',
    heading: 'Segurança da informação',
    body: (
      <P>
        Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados pessoais contra acessos
        não autorizados e situações de destruição, perda, alteração, comunicação ou qualquer forma de
        tratamento inadequado ou ilícito, incluindo conexão segura (HTTPS), controle de acesso e uso de
        fornecedores de infraestrutura reconhecidos no mercado. Nenhum sistema é 100% infalível, e nos
        comprometemos a agir rapidamente para mitigar e comunicar eventuais incidentes de segurança relevantes,
        conforme exigido pela LGPD.
      </P>
    ),
  },
  {
    id: 'direitos',
    heading: 'Seus direitos como titular dos dados',
    body: (
      <>
        <P>Nos termos do art. 18 da LGPD, você tem direito a:</P>
        <UL
          items={[
            'Confirmação da existência de tratamento dos seus dados;',
            'Acesso aos dados que temos sobre você;',
            'Correção de dados incompletos, inexatos ou desatualizados;',
            'Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;',
            'Portabilidade dos dados a outro fornecedor de serviço, mediante requisição;',
            'Eliminação dos dados tratados com base no seu consentimento;',
            'Informação sobre as entidades com as quais compartilhamos seus dados;',
            'Revogação do consentimento, a qualquer momento;',
            'Oposição a tratamento realizado com base em hipótese legal que não o consentimento.',
          ]}
        />
        <P>
          Para exercer qualquer um desses direitos, entre em contato pelo e-mail{' '}
          <a href="mailto:contato@ravennstudio.com" className="text-rv-purple-400 hover:underline">
            contato@ravennstudio.com
          </a>
          . Responderemos dentro de um prazo razoável, conforme previsto na legislação.
        </P>
      </>
    ),
  },
  {
    id: 'criancas',
    heading: 'Dados de crianças e adolescentes',
    body: (
      <P>
        Nosso site é direcionado a públicos empresarial e adulto, e não coletamos intencionalmente dados de
        menores de 18 anos. Caso identifiquemos que dados de uma criança ou adolescente foram coletados sem o
        consentimento apropriado de um responsável legal, tomaremos as medidas necessárias para excluí-los.
      </P>
    ),
  },
  {
    id: 'encarregado',
    heading: 'Encarregado de proteção de dados (DPO)',
    body: (
      <P>
        Para questões relacionadas ao tratamento de dados pessoais, exercício de direitos ou dúvidas sobre esta
        política, entre em contato com nosso encarregado pelo e-mail{' '}
        <a href="mailto:contato@ravennstudio.com" className="text-rv-purple-400 hover:underline">
          contato@ravennstudio.com
        </a>
        .
      </P>
    ),
  },
  {
    id: 'alteracoes',
    heading: 'Alterações desta política',
    body: (
      <P>
        Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas
        práticas ou por exigência legal ou regulatória. A data da última atualização está sempre indicada no
        topo desta página. Recomendamos que você a revise com regularidade.
      </P>
    ),
  },
  {
    id: 'contato-foro',
    heading: 'Contato, legislação aplicável e foro',
    body: (
      <P>
        Esta política é regida pelas leis da República Federativa do Brasil, em especial pela Lei nº
        13.709/2018 (LGPD). Fica eleito o foro da Comarca de Niterói, Rio de Janeiro, para dirimir eventuais
        controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja. Dúvidas sobre esta
        política podem ser enviadas para{' '}
        <a href="mailto:contato@ravennstudio.com" className="text-rv-purple-400 hover:underline">
          contato@ravennstudio.com
        </a>{' '}
        — Ravenn Studio, CNPJ 61.019.754/0001-88, Niterói/RJ.
      </P>
    ),
  },
];

export default function PoliticaPrivacidade() {
  return (
    <LegalPage
      title="Política de Privacidade"
      lastUpdated={LAST_UPDATED}
      sections={sections}
      otherDoc={{ label: 'Termos de Uso', href: '/termos-de-uso.html' }}
    />
  );
}
