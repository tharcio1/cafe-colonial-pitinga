# Piquenique na Pitinga

Landing page em Vue 3 + Vite, mobile-first, com imagens fornecidas em `imgs/`, fontes locais e formulário de nome e telefone. A página não exibe datas ou horários fixos: esses detalhes são combinados diretamente com a organização, conforme a disponibilidade. Os benefícios e o preço do **pacote de R$ 250,00** foram extraídos do anúncio fornecido. O anúncio não especifica se o preço é por pessoa ou casal, por isso a página usa apenas "pacote". Confirme essas informações antes da divulgação.

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

## Formulário em modo de teste — sem envio de e-mail

O formulário é apenas uma demonstração. Ao clicar em **Quero participar**, exige que nome e telefone estejam preenchidos. Campos vazios exibem um aviso individual e o primeiro campo pendente recebe o foco; nomes contendo apenas espaços também são considerados vazios. Com ambos preenchidos, exibe imediatamente **“Solicitação realizada com sucesso!”** e **“Um dos nossos colaboradores entrará em contato para fornecer todas as informações.”**. A validação verifica apenas o preenchimento, sem confirmar a validade do número. O botão fixo no celular segue a mesma regra.

**Nenhum e-mail é enviado e nenhum contato é transmitido ou armazenado pelo site.** A integração com o FormSubmit foi removida. Não é necessário ativar um provedor nem configurar credenciais. A confirmação funciona até sem conexão, desde que a página já esteja carregada.

A mensagem sobre o contato de um colaborador faz parte da simulação: ela não aciona uma equipe nem cria uma reserva. Os avisos do formulário e de privacidade identificam a demonstração. Para captar contatos reais futuramente, será necessário implementar novamente uma integração de envio e validar a entrega.

## Publicar na Vercel

O arquivo `vercel.json` já define Vite, `npm run build` e a pasta `dist`.

1. Crie um repositório pessoal no GitHub e envie o projeto inteiro, incluindo `imgs/` e `package-lock.json`. Não envie `node_modules/` ou `dist/`.
2. Na Vercel, escolha **Import Project → Import**, conecte o GitHub e selecione esse repositório.
3. Confira: **Framework: Vite**, **Build Command: npm run build**, **Output Directory: dist**. Não há variáveis de ambiente obrigatórias.
4. Clique em **Deploy**. Depois da publicação, teste a confirmação simulada do formulário.

Alternativa pela CLI, com autenticação na sua conta: `npx vercel`. Para publicar em produção: `npx vercel --prod`.

### Atualizar um site já publicado

Se o projeto estiver conectado ao GitHub com os deployments automáticos habilitados, faça commit e push das alterações para a branch de produção configurada na Vercel (normalmente `main`). A Vercel compila e publica a atualização automaticamente no mesmo endereço, quando o build termina com sucesso. Salvar os arquivos apenas no computador não atualiza o site público. Pushes em outras branches normalmente geram prévias, não atualizam a produção. Acompanhe o resultado em **Deployments** no painel. Veja a [documentação da integração Git](https://vercel.com/docs/git).

Se publicou pela CLI sem integração Git, publique novamente com `npx vercel --prod` na pasta do projeto atualizado.

**Plano:** a Vercel limita o [Hobby gratuito a uso pessoal e não comercial](https://vercel.com/docs/plans/hobby). Como a página promove um pacote de experiência, confira um plano apropriado antes de publicá-la comercialmente. A compatibilidade técnica com Vercel não significa elegibilidade para o Hobby. Nenhuma publicação é realizada pelo build.

## Ajustes e verificações

- Conteúdo e confirmação simulada: `src/App.vue`.
- Visual mobile-first: `src/style.css` (telas maiores são adaptações com `min-width`).
- Fotos originais: `imgs/`; versões otimizadas: `public/images/`.
- Testes de interface: com a prévia rodando na porta 5173 e Chrome instalado, execute `npm run test:ui`. É possível apontar `PREVIEW_URL` para outra prévia local.
- Testes verificam avisos para campos vazios, sucesso com ambos preenchidos, botão mobile, teclado e modo offline, além de garantir a ausência de requisições de envio. Capturas ficam em `artifacts/` (não versionadas).

A página apresenta datas e horários sob consulta, sem calendário fixo. Usa as imagens fornecidas como ilustrações, sem inventar avaliações, depoimentos ou contadores de vagas.
