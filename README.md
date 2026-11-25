# IVG Company — estoque e pedidos · v0.2

Atualização da prévia para validar o funcionamento com Letícia e Nicole. O trabalho de design fica para uma próxima etapa. Este projeto é independente do otimizador da Pontual.

## Como substituir os arquivos no GitHub

1. Extraia o ZIP.
2. Abra a pasta `IVG-Estoque` e envie **todo o conteúdo dela** para a raiz do repositório da prévia, substituindo os arquivos anteriores. O `index.html` deve estar na raiz, não dentro de uma segunda pasta.
3. Envie também a pasta `assets`, os novos arquivos `company.js` e `print.js` e o `vercel.json`.
4. Faça o commit. Se a prévia já estiver conectada ao repositório, acompanhe o novo deploy.
5. Reabra o endereço e atualize a página com Ctrl+F5. Feche abas que ainda estiverem na versão anterior antes de continuar os testes.

O pacote é um site estático, sem instalação de pacotes ou comando de build. A configuração incluída define `framework: null` e saída `.`. Se configurar o projeto manualmente, use o preset **Other**, sem comando de build e com o diretório de saída `.`. Mantenha a raiz do projeto apontando para a pasta que contém o `index.html`.

Para experimentar antes de enviar, abra `index.html` no Chrome ou Edge atualizado. Os arquivos precisam permanecer juntos.

## O que mudou

- Identificação comercial **IVG Company**, conforme solicitado.
- Logo original extraída do PDF recebido, sem redesenho. Na imagem fornecida está escrito **EVG Company**. Os dados cadastrais e a razão social **EVG COMPANY COMÉRCIO DE PRODUTOS LTDA** foram preservados como constam no PDF. A configuração está em `company.js`.
- Cadastro de material: MDF, MDP, aglomerado, compensado ou outro. O material participa da identificação do produto e tem saldo independente.
- Cadastro de chapas por material, cor/padrão, espessura, marca e classificação (Primeira, PD ou LD).
- Edição do cadastro e preço de referência, preservando o saldo. Com saldo positivo, alterações de identidade são bloqueadas; é possível informar o material que estava “A conferir”. Isso evita reclassificar chapas sem uma movimentação definida.
- Escolha entre **Pedido** e **Orçamento** no formulário.
- **Emitir e imprimir pedido** confirma a venda, valida todos os itens e baixa o estoque uma única vez. Se faltar algum item, nenhuma baixa e nenhum pedido são gravados.
- Orçamentos permanecem sem baixa; podem ser confirmados e impressos depois.
- Reimpressão com ou sem valores, sem nova baixa de estoque.
- Impressão A4 baseada na estrutura do PDF: empresa, cliente, número, vendedor/data, chapas, quantidade total, subtotal, observações, prazo de entrega, pagamento, assinaturas e data de entrega.
- Desconto em reais **ou** percentual. O valor líquido é calculado a partir do modo escolhido, sem copiar a divergência matemática encontrada no exemplo.
- Entrada, saldo restante, número de parcelas e distribuição exata dos centavos. Se as parcelas não forem iguais, a impressão informa as quantidades e valores de cada grupo.
- Endereço adicional no cliente e prazo de entrega em texto, permitindo “A combinar”.

## Fluxo para apresentar à equipe

1. Na primeira abertura, clique em **Experimentar com dados fictícios**. Isso cadastra 10 MDF Branco TX Primeira, 4 MDF Branco TX PD e 6 MDF Louro freijó LD, além de um cliente fictício. Nenhum dado do cliente real do PDF foi incorporado.
2. Vá em **Pedidos e orçamentos** e crie um pedido de 5 unidades do MDF Branco TX Primeira.
3. Confira os dados e clique em **Emitir e imprimir pedido**. O saldo dessa chapa passa de 10 para 5.
4. A janela de impressão permite imprimir em papel ou salvar como PDF. Use papel A4 e desative os cabeçalhos/rodapés do navegador para uma apresentação mais limpa.
5. Reimprima a via com ou sem valores; o saldo deve continuar em 5.
6. Crie um orçamento e confira que ele não reduz o saldo.
7. Um pedido acima do saldo disponível será recusado.

**Cancelar a janela de impressão não cancela a venda nem devolve o estoque.** A baixa acontece na confirmação do pedido; o navegador não informa se a folha realmente saiu da impressora. Devoluções e cancelamentos ainda aguardam a regra operacional por escrito.

Na via sem valores, preços e o quadro de pagamento são omitidos. As observações livres permanecem; evite escrever valores nesse campo se a via for usada para separação sem preços.

## Dados da versão anterior

A chave de armazenamento do protótipo foi mantida para preservar os testes anteriores **quando a prévia continuar no mesmo endereço e navegador**. A migração preserva IDs, saldos, clientes, pedidos e movimentações. Descrições e preços de pedidos antigos são mantidos como foram emitidos.

Produtos antigos sem tipo de material aparecem como **A conferir**, pois a versão anterior não guardava essa informação. Clique em **Editar** e escolha o material correto; o saldo será preservado. Não presumimos que todos os cadastros antigos eram MDF.

Mudar de domínio, navegador, perfil ou computador não transfere os dados. Use **Exportar dados** antes de trocar o endereço. O JSON é uma cópia de consulta; a interface de importação ainda não foi implementada.

## Limites desta prévia

- Dados somente no navegador, sem autenticação, banco central ou sincronização.
- O nome Letícia na lateral representa o perfil previsto; não é um login autenticado.
- Ainda não usar como controle real da empresa. Estoque inicial depende da contagem e conferência física por classificação.
- Devoluções, cancelamentos, ajustes de inventário e reclassificação entre Primeira/PD/LD dependem das regras que serão enviadas.
- Não emite nota fiscal e não se integra ao sistema anterior.
- Ainda não inclui edição de clientes, edição de pedidos emitidos, restauração por JSON, agrupamento por ambiente ou entregas parciais.
- A numeração da prévia é sequencial com ano na impressão; a continuidade da numeração antiga precisa ser definida antes da implantação.
- A estrutura de impressão foi implementada com base no PDF. A conferência visual no navegador e na impressora da equipe fica pendente nesta entrega; podem ser necessários ajustes de margens/quebras conforme o navegador e a quantidade de itens.

## Verificação técnica

Sem dependências de terceiros para funcionar. Com Node.js atualizado, execute:

```sh
node --test core.test.cjs
```

Testes abrangem baixa única, falta de estoque, atomicidade, quantidades, classificação/material, migração, edição sem alteração de saldo, desconto em reais/percentual, parcelas, conteúdo da impressão, via sem valores e escape de dados.

Arquivos principais: `index.html`, `style.css`, `app.js`, `core.js`, `company.js`, `print.js`, `assets/logo-company.jpeg` e `vercel.json`.
