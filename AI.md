# Uso de Inteligência Artificial no desenvolvimento

Este documento descreve como a IA foi usada no MobiBus. Ele cobre o dashboard (Next.js) e a integração com o FIWARE. O firmware do ESP32 roda no Wokwi e não está neste repositório.

## Ferramentas utilizadas

Claude Code, da Anthropic. O modelo da sessão foi o Claude Sonnet 5.5. A ferramenta lê os arquivos do projeto, edita código, roda comandos no terminal e responde em conversa.

Finalidades:
- escrever e alterar código do dashboard e das rotas de integração com o FIWARE;
- explicar conceitos (FIWARE, MQTT, tipos do React) e conferir a lógica de trechos que o grupo já tinha escrito;
- diagnosticar erros de TypeScript, de lint e de comunicação entre o dashboard, o FIWARE e o Wokwi;
- escrever documentação (este arquivo).

## Interações realizadas

Os prompts abaixo são exemplos reais da conversa, em português, resumidos. Cada um mostra o que foi pedido e o que a IA respondeu ou fez.

1. Pergunta: "quando adicionado o ônibus está sendo provisionado no fireware ou só no dashboard". Resposta: o cadastro valia só para a lista local do dashboard (guardada no navegador), sem criar nada no FIWARE. O grupo então pediu "modifique, é para fazer o cadastro no fireware também", e a IA implementou o cadastro no IoT Agent, a criação da entidade no Orion e a assinatura do STH-Comet.

2. Pedido: "toda as alterações feitas na dashboard como adição ou exclusão devem ser aplicadas no fireware". Resposta: edição e remoção também passaram a ser aplicadas no FIWARE, com a regra de que a lista do dashboard só muda se o FIWARE aceitar a operação.

3. Pedido: "todos os dispositivos cadastrados no fireware devem aparecer com o nome de cadastro". Quando os dispositivos continuaram sem aparecer, o grupo colou o painel de diagnóstico na conversa. A leitura dele mostrou que o IoT Agent só tinha dispositivos "vinheria", de outro projeto, e nenhum ônibus.

4. Problema: "estou apertando o botão para resolver o problema mais nada de ser resolvido". Os comandos ficavam em PENDING. A IA sugeriu verificar, em ordem, o Orion, o IoT Agent, o Mosquitto e o ESP32, e passou comandos de `docker` e `mosquitto_sub` para rodar no servidor. A IA suspeitou do firmware ou da conexão MQTT. A causa real foi encontrada pelo grupo: havia duas simulações do Wokwi rodando com o mesmo client id MQTT.

5. Pedido: "preciso que implemente no dashboard, no painel do ônibus, a medição simulada no wokwi da pressão dos pneus". Resposta: a IA mapeou p1 a p6 para os atributos `pressaoPneu1` a `pressaoPneu6` e criou o card de pressão no painel do ônibus.

6. Pedido: criar um alerta quando um valor passar de um limite, porque o ESP já tinha isso configurado. A IA não tinha o firmware e perguntou os valores em vez de inventar. O grupo informou os limites do código (35 °C interna e 100 °C no motor), e depois pediu para o motor ficar em 80 °C no dashboard.

## Aplicação no projeto

Escritos ou alterados com a IA:
- Rotas `/api/fiware/*` (`src/app/api/fiware/`): consulta de ônibus, dispositivos, histórico, comandos e provisionamento. O navegador chama essas rotas, e elas falam com o Orion, o IoT Agent e o STH-Comet.
- Biblioteca `src/lib/fiware/`: configuração dos atributos e limites, leitura e status dos ônibus, sincronização de cadastro, edição e remoção, e os hooks de atualização a cada 5 segundos.
- Componentes do dashboard: grid de ônibus, card, painel de detalhe com comandos e pressão dos pneus, formulário de cadastro e edição, badge de status e painel de diagnóstico.
- Página de configurações da conexão com o FIWARE.
- Barra lateral com destaque do link ativo e comportamento responsivo.
- Login e proteção do dashboard por `localStorage`. A IA fez a correção do `LoginForm` (erro de tipo do TypeScript) e reescreveu o `AuthVerify`.
- Alertas de temperatura, a troca do termo "rota" por "número do ônibus" na interface, o README.md e este arquivo.

Decisões que foram do grupo, e não da IA:
- manter o login por `localStorage` e deixar a autenticação das rotas da API para a produção;
- não alterar o nginx nem o docker-compose do servidor FIWARE;
- o tipo de entidade `Onibus` configurável e o ID `urn:ngsi-ld:Onibus:<número>`;
- remover uma animação com GSAP que a IA tinha adicionado;
- os limites de temperatura e a escolha do 80 °C para o motor.

## Validação das respostas

O que foi feito com a IA:
- `npx tsc --noEmit` e `npx eslint src` depois de cada mudança relevante, e `npm run build` para conferir o build de produção.
- Testes das rotas `/api/fiware/*` com servidores simulados do Orion e do IoT Agent, usando `curl`, incluindo os casos de erro (servidor fora do ar, ônibus inexistente, comando sem registro).
- Scripts em Node para a lógica pura: ordenação do grid, status, validação do cadastro, sincronização (inclusive quando o FIWARE recusa) e interpretação do resultado dos comandos.
- Consultas de leitura ao Orion real para conferir dados. Em uma delas, o `TimeInstant` do ônibus 001 estava parado, o que mostrou que o problema de dados desatualizados estava antes do dashboard.

O que o grupo fez:
- Rodou o dashboard e o Wokwi, conferiu o resultado na tela, descobriu a causa dos comandos em PENDING e apontou erros de comportamento ("não está atualizando", "não está funcionando na Vercel").
- Corrigiu e desfez mudanças da IA por conta própria, como a animação com GSAP, e pediu para não alterar arquivos quando só queria uma explicação.

O que não foi testado:
- Nenhuma tela foi conferida pela IA em um navegador. Toda a interface foi vista apenas pelo grupo.
- A integração completa com o FIWARE real (cadastro, edição, remoção e comandos) foi testada contra servidores simulados e, na leitura, contra o Orion real. O fluxo ponta a ponta com o firmware dependeu do Wokwi, que a IA não consegue ver.
- A publicação na Vercel não foi verificada pela IA.

## Análise crítica

Benefícios:
- A integração com o FIWARE tem muitas partes (IoT Agent, Orion, STH-Comet, MQTT). A IA acelerou a escrita das rotas e da sincronização e explicou o papel de cada serviço.
- Erros de tipo, de lint e de layout foram corrigidos rápido, quase sempre com a causa explicada.
- Os testes com servidores simulados pegaram problemas antes de chegarem ao grupo.

Limitações:
- A IA não enxerga o Wokwi, o firmware, o servidor na AWS nem o navegador. Ela trabalhou com o que o grupo colava (logs, saídas de comando) e com o código do repositório.
- Os primeiros diagnósticos do problema dos comandos em PENDING apontaram para o firmware e para o MQTT. A causa real, duas simulações com o mesmo client id, foi achada pelo grupo.
- Os testes com servidores simulados só provam o que o simulador reproduz. Um deles não tinha a listagem de entidades e gerou falsos erros 404, que foram descobertos ao repetir o teste com outro simulador.
- O servidor de desenvolvimento chegou a usar um módulo antigo, e o teste teve de ser feito contra o build de produção.
- O código do login tem as credenciais no navegador e uma sessão que qualquer pessoa consegue forjar. É só uma demonstração. As rotas da API também ficaram sem autenticação, por decisão do grupo, e isso precisa ser resolvido antes de uso real.

Dificuldades:
- Em vários momentos a IA fez mais do que o pedido, como a animação com GSAP, e o grupo teve de pedir que só explicasse ou que corrigisse um arquivo específico.
- Descrever um problema ("não atualiza", "não funciona na Vercel") sem o erro ou o log atrasa o diagnóstico. Nos casos em que o grupo colou a mensagem exata, a causa apareceu bem mais rápido.
- A IA pode afirmar algo com segurança e estar errada. O que valeu como prova foram os testes e a confirmação do grupo no ambiente real.
