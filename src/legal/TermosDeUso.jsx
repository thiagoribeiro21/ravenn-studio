import LegalPage, { P, UL } from './LegalPage';

const LAST_UPDATED = '17 de agosto de 2026';

const sections = [
  {
    id: 'aceitacao',
    heading: 'Aceitação dos termos',
    body: (
      <P>
        Estes Termos de Uso regem o acesso e a utilização do site ravennstudio.com.br e das landing pages
        vinculadas a ele, de propriedade da Ravenn Studio. Ao acessar e navegar neste site, você concorda
        integralmente com estes termos. Caso não concorde com qualquer disposição aqui prevista, recomendamos
        que interrompa o uso do site.
      </P>
    ),
  },
  {
    id: 'sobre',
    heading: 'Sobre a Ravenn Studio',
    body: (
      <P>
        A Ravenn Studio é uma agência de web design e marketing digital, com atuação em Niterói/RJ e atendimento
        remoto a clientes em todo o Brasil, especializada em criação de sites de alta conversão, automação de
        atendimento com inteligência artificial e gestão de tráfego pago. Ravenn Studio, CNPJ 61.019.754/0001-88,
        com sede em Niterói, Rio de Janeiro.
      </P>
    ),
  },
  {
    id: 'objeto',
    heading: 'Objeto do site',
    body: (
      <>
        <P>
          Este site tem caráter institucional e comercial: apresenta o portfólio, os serviços e a forma de
          contato da Ravenn Studio. A simples navegação ou o envio de uma mensagem por formulário, WhatsApp ou
          e-mail <strong className="text-rv-titanium">não constitui, por si só, contratação de serviço</strong>.
        </P>
        <P>
          Qualquer prestação de serviço (desenvolvimento de site, automação, gestão de tráfego pago ou
          qualquer outro) é formalizada por meio de proposta comercial e/ou contrato específico, com escopo,
          prazos, valores e condições próprias, que prevalecem sobre estes Termos de Uso no que for aplicável
          à relação contratual.
        </P>
      </>
    ),
  },
  {
    id: 'uso-do-site',
    heading: 'Uso do site',
    body: (
      <>
        <P>Ao utilizar este site, você concorda em não:</P>
        <UL
          items={[
            'Utilizar o site para qualquer finalidade ilícita ou não autorizada;',
            'Tentar obter acesso não autorizado a sistemas, servidores ou dados da Ravenn Studio;',
            'Copiar, reproduzir, distribuir ou explorar comercialmente o conteúdo do site sem autorização prévia por escrito;',
            'Utilizar robôs, scrapers ou qualquer meio automatizado para extrair dados do site sem autorização;',
            'Interferir ou tentar interferir no funcionamento normal do site ou de seus servidores;',
            'Transmitir vírus, malware ou qualquer código malicioso através do site.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'propriedade-intelectual',
    heading: 'Propriedade intelectual',
    body: (
      <P>
        Todo o conteúdo deste site — incluindo, mas não se limitando a, textos, imagens, vídeos, identidade
        visual, marca, layout, design, código-fonte e estrutura — é de propriedade da Ravenn Studio ou
        utilizado sob licença, e está protegido pela legislação brasileira de direitos autorais e propriedade
        industrial (Lei nº 9.610/1998 e Lei nº 9.279/1996). É proibida a reprodução, distribuição ou uso
        comercial de qualquer parte deste conteúdo sem autorização prévia e expressa da Ravenn Studio.
      </P>
    ),
  },
  {
    id: 'orcamentos',
    heading: 'Formulários, orçamentos e contato via WhatsApp',
    body: (
      <>
        <P>
          Orçamentos, estimativas de prazo e valores apresentados neste site, em conversas por WhatsApp ou por
          e-mail têm caráter informativo e não vinculante, podendo variar conforme o escopo real do projeto
          após análise detalhada. Nenhum valor é considerado definitivo até a formalização de uma proposta
          comercial aceita por ambas as partes.
        </P>
        <P>
          Ao preencher um formulário ou iniciar uma conversa pelo WhatsApp, você declara que as informações
          fornecidas são verdadeiras e autoriza a Ravenn Studio a utilizá-las para responder ao seu contato,
          conforme detalhado em nossa{' '}
          <a href="/politica-de-privacidade.html" className="text-rv-purple-400 hover:underline">
            Política de Privacidade
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: 'links-terceiros',
    heading: 'Links e conteúdo de terceiros',
    body: (
      <P>
        Este site pode exibir exemplos de projetos, conceitos autorais e, eventualmente, links para sites de
        terceiros (incluindo projetos de clientes reais). A Ravenn Studio não se responsabiliza pelo conteúdo,
        pela política de privacidade ou pelas práticas de sites de terceiros. O acesso a esses links é de
        responsabilidade exclusiva do usuário.
      </P>
    ),
  },
  {
    id: 'disponibilidade',
    heading: 'Disponibilidade e isenção de garantias',
    body: (
      <P>
        Envidamos esforços razoáveis para manter o site disponível, atualizado e livre de erros, mas não
        garantimos disponibilidade ininterrupta ou ausência total de falhas. O site é fornecido "como está",
        sem garantias de qualquer natureza quanto a resultados específicos decorrentes apenas da navegação ou
        contato — resultados de negócio dependem de escopo, execução e fatores externos ao controle exclusivo
        da Ravenn Studio, e são tratados de forma específica em eventual contrato de prestação de serviço.
      </P>
    ),
  },
  {
    id: 'limitacao-responsabilidade',
    heading: 'Limitação de responsabilidade',
    body: (
      <P>
        Na máxima extensão permitida pela legislação aplicável, a Ravenn Studio não se responsabiliza por
        danos indiretos, incidentais ou consequenciais decorrentes do uso ou da impossibilidade de uso deste
        site, incluindo, mas não se limitando a, perda de dados, lucros cessantes ou interrupção de atividades,
        exceto nos casos de dolo ou culpa grave comprovados.
      </P>
    ),
  },
  {
    id: 'privacidade',
    heading: 'Proteção de dados pessoais',
    body: (
      <P>
        O tratamento de dados pessoais coletados por meio deste site é detalhado em nossa{' '}
        <a href="/politica-de-privacidade.html" className="text-rv-purple-400 hover:underline">
          Política de Privacidade
        </a>
        , que é parte integrante destes Termos de Uso.
      </P>
    ),
  },
  {
    id: 'alteracoes',
    heading: 'Alterações destes termos',
    body: (
      <P>
        A Ravenn Studio pode atualizar estes Termos de Uso a qualquer momento, para refletir mudanças em suas
        práticas, serviços ou por exigência legal. A data da última atualização está sempre indicada no topo
        desta página. O uso continuado do site após qualquer alteração implica concordância com os novos
        termos.
      </P>
    ),
  },
  {
    id: 'legislacao-foro',
    heading: 'Legislação aplicável e foro',
    body: (
      <P>
        Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
        Comarca de Niterói, Rio de Janeiro, para dirimir quaisquer controvérsias decorrentes destes termos, com
        renúncia expressa a qualquer outro foro, por mais privilegiado que seja.
      </P>
    ),
  },
  {
    id: 'contato',
    heading: 'Contato',
    body: (
      <P>
        Dúvidas sobre estes Termos de Uso podem ser enviadas para{' '}
        <a href="mailto:contato@ravennstudio.com" className="text-rv-purple-400 hover:underline">
          contato@ravennstudio.com
        </a>{' '}
        ou pelo WhatsApp disponível neste site.
      </P>
    ),
  },
];

export default function TermosDeUso() {
  return (
    <LegalPage
      title="Termos de Uso"
      lastUpdated={LAST_UPDATED}
      sections={sections}
      otherDoc={{ label: 'Política de Privacidade', href: '/politica-de-privacidade.html' }}
    />
  );
}
