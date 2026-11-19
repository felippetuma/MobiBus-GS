# MobiBus

O MobiBus é um dashboard web para monitorar ônibus em tempo real. Cada ônibus tem um ESP32 que mede temperatura interna, umidade, temperatura do motor e a pressão dos seis pneus, e que também envia o alerta do botão do motorista. O dashboard mostra esses dados, avisa quando um limite é ultrapassado e envia comandos de volta ao ônibus (resolver alerta, ligar e desligar o buzzer, disparar e cancelar o alarme de temperatura).

O firmware do ESP32 não faz parte deste repositório. Ele roda no simulador Wokwi, e este projeto contém apenas o dashboard.

Dashboard publicado na Vercel: [`Link do Site do MobiBus na Vercel`](https://mobi-bus-gs.vercel.app/)


## Funcionalidades

- Grid com todos os ônibus conhecidos pelo FIWARE e pela lista local, com status Ativo, Sem dados recentes ou Sem registro.
- Página de cada ônibus com temperatura interna, umidade, temperatura do motor e pressão dos pneus p1 a p6.
- Alertas do botão do motorista e de temperatura (interna acima de 35 °C, motor acima de 80 °C). Os limites ficam em `src/lib/fiware/config.ts`.
- Cadastro, edição e remoção de ônibus. Cada operação é aplicada também no FIWARE (dispositivo no IoT Agent, entidade no Orion e assinatura do STH-Comet).
- Comandos para o ônibus, com a resposta do firmware (OK, ERROR ou PENDING).
- Painel de diagnóstico da conexão, que lista os dispositivos que o FIWARE devolveu e os que o dashboard ignorou, com o motivo.

## Pré-requisitos

- Node.js 20.9 ou superior (o desenvolvimento foi feito com a versão 22).
- npm, que vem com o Node.js.
- Git.
- Um servidor FIWARE acessível pela rede, com estas portas abertas para o computador ou para a Vercel que roda o dashboard:
  - 1026: Orion Context Broker
  - 4041: IoT Agent UL (provisionamento de dispositivos)
  - 8666: STH-Comet (histórico)
- Um ESP32 (ou a simulação no Wokwi) publicando por MQTT no padrão `/TEF/onibus<rota>/attrs/...`. Sem ele o dashboard abre, mas os ônibus aparecem como Sem dados recentes.

## Repositórios relacionados

O dashboard depende de duas partes que ficam fora deste repositório.

### Servidor FIWARE

Repositório: [`Link do Repositório do projeto de Edge com o Fiware`](https://github.com/felippetuma/MobiBus-Edge)

Sobe o Orion, o IoT Agent, o STH-Comet e o Mosquitto. As instruções de instalação e execução do servidor estão no README desse repositório.

### Simulação do ESP32 no Wokwi

Projeto: [`Link da Simulação no Wokwi`](https://wokwi.com/projects/481124307203422209)

Contém o firmware e o circuito do ônibus. Rode apenas uma simulação por vez: duas simulações usam o mesmo client id MQTT e uma derruba a outra, e os dados deixam de chegar ao dashboard.

## Instalação

```bash
git clone https://github.com/felippetuma/MobiBus-GS
cd mobibus
npm install
```

## Execução

Para desenvolver:

```bash
npm run dev
```

Abra http://localhost:3000.

Para gerar e rodar a versão de produção:

```bash
npm run build
npm start
```
## Primeiro uso

1. Acesse `/login` e entre com as credenciais de demonstração (definidas em `src/components/LoginForm.tsx`):
   - E-mail: `admin@mobibus.com.br`
   - Senha: `MobibusAdmin123`
2. Abra Configurações e preencha o IP do servidor FIWARE, o serviço (por exemplo `smart`), o path do serviço (`/`), o tipo da entidade (`Onibus`) e a URL de notificação do STH-Comet (por exemplo `http://sth-comet:8666/notify`). Depois de salvar, o indicador de conexão deve mostrar Ativo.
3. Os ônibus já cadastrados no FIWARE aparecem no grid. Para criar um novo, use Cadastrar ônibus e informe o número e o nome. O ID no FIWARE será `urn:ngsi-ld:Onibus:<número>`, e o dispositivo será `onibus<número>`.

## Integrantes

| Nome Completo | RM's |
| ------------- | ---- |
| Davi Yuu Santos Toyota | 569557 |
| Felipe Santana Motta | 570550 |
| Felippe Tuma Costa | 569459 |
| Renan Martins da Silva | 569549 |
| Yan da Silva Lima | 572373 |