# Pontual — estoque e pedidos · início do projeto

Versão 0.1 para avaliar o fluxo com Letícia e Nicole. Este projeto é independente do otimizador de corte.

## Abrir a primeira versão

Extraia o ZIP e abra `index.html` no Chrome ou Edge atualizado. Todos os arquivos devem permanecer na mesma pasta. Não precisa instalar pacotes.

Comece com dados fictícios pelo botão **Experimentar com dados fictícios**, ou cadastre chapas e um cliente manualmente. O navegador guarda as alterações localmente. O botão **Exportar dados** baixa um JSON para consulta e cópia dos dados de avaliação; importação ainda não foi implementada.

**Esta é uma versão de avaliação, não deve ser usada para controlar o estoque real da empresa.** Ainda não há servidor, autenticação, backup automático ou sincronização entre computadores. O nome Letícia na lateral representa o perfil previsto e não um login autenticado. A proteção de abas evita atualizações com dados desatualizados, mas não substitui transações no servidor em um sistema em produção.

## Requisitos recebidos em 25/11/2026

| Assunto | Informação confirmada no áudio |
|---|---|
| Identificação das chapas | Cor/padrão, espessura, marca e classificação |
| Classificações | Primeira (sem defeitos), PD (pequenos detalhes), LD (leves defeitos) |
| Situação atual | Anotações em papel/Word; não há controle confiável de estoque |
| Estoque inicial | Deve ser contado fisicamente e separado por classificação |
| Baixa | Quando o pedido é emitido, antes da entrega |
| Usuária principal | Letícia; Nicole cobre suas ausências |
| Equipamento | Principalmente o computador da Letícia; possível acesso por outro computador |
| Permissões | Alterações de estoque e cancelamentos restritos ao perfil autorizado da Letícia |
| Pedido | Deve contemplar as informações do modelo mostrado no vídeo |
| Nota fiscal | Fora do escopo informado |

## O que já funciona nesta versão

- Cadastro separado de cada combinação de cor, marca, espessura e classificação.
- Quantidade inicial zero e entradas com quantidade inteira positiva e referência da conferência.
- Clientes com campos de identificação, endereço e contato vistos no vídeo.
- Orçamentos com vendedor, data, prazo, chapas, quantidades, preços, desconto em reais, entrada, parcelas, pagamento e observações.
- Orçamento sem reserva ou baixa de estoque; é uma proposta de fluxo a validar.
- Confirmação do pedido valida todos os itens antes de alterar qualquer saldo e impede saldo negativo.
- Pedido confirmado preserva os dados do cliente e os preços no momento da emissão.
- Reimprimir não altera estoque; a confirmação não pode ser repetida.
- Histórico automático de entradas e saídas.
- Impressão provisória em A4, também salvável como PDF pelo navegador.

## Decisões provisórias e pendências

1. **PDF de referência:** ajustar cabeçalho, razão social da empresa vendedora, campos, contrato/textos, assinaturas, agrupamento por ambiente e variantes de impressão com/sem valores. O áudio menciona DVG, mas a transcrição/nome jurídico precisa ser confirmado. Não usamos dados reais dos clientes do vídeo.
2. **Desconto:** vídeo mostra possibilidade de percentual; esta versão usa reais. Adicionar percentual na próxima etapa, junto do layout definitivo.
3. **Pedido e impressão:** a confirmação efetua a baixa; imprimir ou cancelar a janela de impressão não altera o saldo. O navegador não informa se a folha foi realmente impressa. Validar a ação conjunta “Confirmar e imprimir” para o uso diário.
4. **Devoluções e cancelamentos:** aguardar a regra escrita. Não foram implementados. Uma devolução futura deve referenciar a venda e devolver somente o que foi recebido/conferido, com a classificação correta. Não criar outra venda para representar devolução.
5. **Reclassificação:** definir como mover uma chapa de Primeira para PD/LD após detectar defeito, com motivo e histórico. Não implementada nesta versão.
6. **Estoque inicial:** cada combinação será contada antes da entrada. Não presumir que um pacote entregue como Primeira contém somente chapas Primeira.
7. **Cadastros:** confirmar se medidas, acabamentos ou fornecedores precisam de campos próprios. Não fixar medida única nem misturar medidas diferentes em uma mesma combinação no sistema definitivo.
8. **Acesso definitivo:** implementar autenticação e autorização no servidor. Definir se Nicole terá conta própria autorizada, preferível para registrar quem realizou cada ação, ou outra forma de cobertura. Por enquanto, nenhum cadastro de acesso foi criado.
9. **Banco e recuperação:** definir hospedagem, persistência central, backup e restauração antes de utilizar dados reais. Esta avaliação usa apenas o armazenamento do navegador.
10. **Orçamentos e correções:** nesta etapa não há edição/exclusão de pedidos nem conversão parcial. Definir correções e entregas parciais caso façam parte da operação.

## Fluxo sugerido para avaliação

1. Carregar os dados fictícios: 10 chapas Branco TX Primeira, 4 Branco TX PD e 6 Louro freijó LD.
2. Criar orçamento de 5 chapas Branco TX Primeira para o cliente de demonstração.
3. Conferir que o saldo permanece em 10 durante o orçamento.
4. Confirmar o pedido; o saldo passa para 5.
5. Imprimir novamente; o saldo continua em 5.
6. Tentar confirmar outro pedido de 6 unidades dessa chapa; a operação deve ser recusada por saldo insuficiente.

## Arquivos

- `index.html`: telas e estrutura.
- `style.css`: apresentação responsiva e impressão.
- `app.js`: interface e persistência local de avaliação.
- `core.js`: regras iniciais de produtos, entradas, clientes, orçamentos e confirmação.
- `core.test.cjs`: testes das regras críticas. Executar com Node: `node --test core.test.cjs`.

Os testes validam saldo por classificação, baixa única, falta de estoque, atomicidade, dados numéricos e preservação do pedido. Validação visual no navegador fica para a próxima revisão; esta entrega passou pelas verificações de sintaxe e pelos testes do núcleo.
