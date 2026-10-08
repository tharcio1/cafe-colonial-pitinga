# Piquenique na Pitinga

Landing page em Vue 3 + Vite, mobile-first, com imagens fornecidas em `imgs/`, fontes locais e formulário de nome e telefone. Data, horário, benefícios e preço foram extraídos do anúncio fornecido: **09/10/2026, às 16h30, pacote de R$ 250,00**. O anúncio não especifica se o preço é por pessoa ou casal, por isso a página usa apenas "pacote". Confirme essas informações antes da divulgação.

## Visualizar e compilar

Requer Node.js 20.19+ ou 22.12+ e npm. No PowerShell, use `npm.cmd` se `npm` for bloqueado pela política de scripts.

```sh
npm install
npm run prepare:images
npm run dev
```

Abra o endereço indicado no terminal. Para gerar o site pronto:

```sh
npm run build
npm run preview
```

O build gera versões WebP responsivas das fotos e os arquivos publicados em `dist/`. Os originais são preservados. O site não usa banco de dados, senha de Gmail nem API paga.

## Envio dos contatos — ativação necessária

O formulário usa o [FormSubmit](https://formsubmit.co/) e envia nome, telefone e identificação do evento para **tharciothalles2@gmail.com** via HTTPS. Este endereço é público no código, não é uma credencial. Apenas nome e telefone são solicitados ao visitante. Não há pagamento nem confirmação automática de reserva.

1. Publique a página no endereço definitivo.
2. Envie um contato de teste pelo formulário.
3. Abra `tharciothalles2@gmail.com`, procure a mensagem de ativação do FormSubmit (inclusive em Spam) e confirme o formulário.
4. Envie um novo teste e confirme o recebimento com nome e telefone corretos antes de divulgar o site.

O recebimento real depende dessa ativação e da disponibilidade do serviço externo; a compilação e os testes locais não confirmam entrega na caixa de entrada. Se mudar de domínio, verifique a necessidade de nova ativação. O envio usa a [API AJAX oficial](https://formsubmit.co/ajax-documentation), com validação, campo antispam invisível, bloqueio de duplicidade durante o envio, tempo limite e tratamento de falhas. A resposta de sucesso significa que o serviço aceitou a solicitação, não que a reserva foi confirmada. Não desativamos explicitamente as proteções do serviço.

O aviso de privacidade explica o envio por esse provedor e o contato para exclusão. Não armazenamos os contatos no navegador. Antes de divulgar, confirme as práticas de tratamento dos dados com a organização.

## Publicar na Vercel

O arquivo `vercel.json` já define Vite, `npm run build` e a pasta `dist`.

1. Crie um repositório pessoal no GitHub e envie o projeto inteiro, incluindo `imgs/` e `package-lock.json`. Não envie `node_modules/` ou `dist/`.
2. Na Vercel, escolha **Import Project → Import**, conecte o GitHub e selecione esse repositório.
3. Confira: **Framework: Vite**, **Build Command: npm run build**, **Output Directory: dist**. Não há variáveis de ambiente obrigatórias.
4. Clique em **Deploy**. Depois da publicação, faça a ativação e o teste do formulário acima.

Alternativa pela CLI, com autenticação na sua conta: `npx vercel`. Para publicar em produção: `npx vercel --prod`.

**Plano:** a Vercel limita o [Hobby gratuito a uso pessoal e não comercial](https://vercel.com/docs/plans/hobby). Como a página promove um pacote de experiência, confira um plano apropriado antes de publicá-la comercialmente. A compatibilidade técnica com Vercel não significa elegibilidade para o Hobby. Nenhuma publicação é realizada pelo build.

## Ajustes e verificações

- Conteúdo e destinatário: `src/App.vue`.
- Visual mobile-first: `src/style.css` (telas maiores são adaptações com `min-width`).
- Fotos originais: `imgs/`; versões otimizadas: `public/images/`.
- Testes de interface: com a prévia rodando na porta 5173 e Chrome instalado, execute `npm run test:ui`. É possível apontar `PREVIEW_URL` para outra prévia local.
- Testes interceptam os envios; não disparam e-mails nem ativam o serviço. Capturas ficam em `artifacts/` (não versionadas).

O evento é fixo; atualize a data e a disponibilidade ou encerre a captação após sua realização. A página usa as imagens fornecidas como ilustrações, sem inventar avaliações, depoimentos ou contadores de vagas.
