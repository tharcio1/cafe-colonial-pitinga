<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Icon from './components/Icon.vue'

const name = ref('')
const phone = ref('')
const honeypot = ref('')
const status = ref('idle')
const errors = ref({})
const formElement = ref(null)
const showMobileCta = ref(true)
let observer

const benefits = [
  { icon: 'coffee', title: 'Café colonial', text: 'Uma mesa compartilhada, preparada em frente ao mar, para saborear sem pressa.' },
  { icon: 'sunset', title: 'Um cenário único', text: 'Pés na areia, brisa do mar e as falésias da Praia da Pitinga como cenário.' },
  { icon: 'camera', title: 'Memórias em fotografias', text: '5 fotografias profissionais por casal ou indivíduo, feitas em frente às falésias.' },
]
const questions = [
  { question: 'O que está incluído no pacote?', answer: 'Acesso ao café colonial compartilhado em frente à praia, a experiência de piquenique com vista para o mar e as falésias, e 5 fotografias profissionais por casal ou indivíduo.' },
  { question: 'Preciso ir acompanhado?', answer: 'Não. A experiência é ideal para casais e também para quem deseja viver um momento especial individualmente. O café colonial é compartilhado.' },
  { question: 'Como funciona a reserva?', answer: 'Preencha seu nome e telefone. A organização entrará em contato para informar a disponibilidade, esclarecer o valor do pacote e combinar os próximos passos. O envio do formulário não confirma uma reserva nem realiza uma cobrança.' },
  { question: 'Onde e quando será o encontro?', answer: 'Na Praia da Pitinga, em Arraial d’Ajuda. A data, o horário e o ponto exato de encontro serão combinados diretamente com a organização, conforme a disponibilidade. Deixe seu contato para saber mais.' },
]

function formatPhone(event) {
  let digits = event.target.value.replace(/\D/g, '')
  if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2)
  digits = digits.slice(0, 11)
  let formatted = digits
  if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length > 6) {
    const split = digits.length === 11 ? 7 : 6
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, split)}-${digits.slice(split)}`
  }
  phone.value = formatted
  event.target.value = formatted
}

async function submitForm() {
  if (status.value === 'sending' || status.value === 'success') return
  const digits = phone.value.replace(/\D/g, '')
  errors.value = {}
  if (name.value.trim().length < 2) errors.value.name = 'Digite seu nome, com pelo menos 2 letras.'
  if (!/^[1-9]{2}(?:9\d{8}|[2-9]\d{7})$/.test(digits)) errors.value.phone = 'Digite um telefone válido com DDD.'
  if (Object.keys(errors.value).length) {
    document.getElementById(errors.value.name ? 'name' : 'phone')?.focus()
    return
  }
  if (honeypot.value) return
  status.value = 'sending'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch('https://formsubmit.co/ajax/tharciothalles2@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        Nome: name.value.trim(),
        Telefone: `+55 ${digits}`,
        Evento: 'Piquenique na Pitinga',
        _subject: 'Novo interesse — Piquenique na Pitinga',
        _template: 'table',
        _honey: honeypot.value,
      }),
    })
    const result = await response.json()
    if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission rejected')
    status.value = 'success'
    name.value = ''
    phone.value = ''
  } catch {
    status.value = 'error'
  } finally {
    clearTimeout(timeout)
  }
}

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => { showMobileCta.value = !entry.isIntersecting }, { threshold: 0.1 })
  if (formElement.value) observer.observe(formElement.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="site-header container">
    <a class="brand" href="#inicio" aria-label="Pitinga, início">
      <Icon name="sunset" class="brand-icon" />
      <span>Pitinga<span class="brand-subtitle">PIQUENIQUE & MEMÓRIAS</span></span>
    </a>
    <nav aria-label="Navegação principal">
      <a class="nav-link" href="#experiencia">A experiência</a>
      <a class="nav-link" href="#detalhes">O encontro</a>
      <a class="button button-small button-outline" href="#interesse">Quero viver isso</a>
    </nav>
  </header>

  <main id="conteudo">
    <section id="inicio" class="hero container" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-line"></span> ARRAIAL D’AJUDA · BAHIA</p>
        <h1 id="hero-title">A vida pede<br />uma <em>pausa.</em><br />Que seja aqui.</h1>
        <p class="hero-description">Um piquenique à beira-mar, um café sem pressa e um fim de tarde para guardar na memória.</p>
        <a class="button button-primary hero-cta" href="#interesse">Quero viver esse momento</a>
        <p class="hero-note"><Icon name="heart" /> Bons momentos ficam melhores quando compartilhados.</p>
      </div>
      <div class="hero-visual">
        <img class="hero-image" src="/images/site1-800.webp" srcset="/images/site1-480.webp 480w, /images/site1-800.webp 800w, /images/site1-1254.webp 1254w" sizes="(min-width: 900px) 53vw, 100vw" width="1254" height="1254" fetchpriority="high" alt="Mesa de piquenique com café, frutas e flores à beira-mar, diante das falésias da Pitinga" />
        <span class="image-label">O MAR. A BRISA. O AGORA.</span>
        <div class="date-card"><Icon name="sunset" /><span class="date-card-divider"></span><span><strong>Um encontro<br />com a leveza.</strong><small>SEU MOMENTO À BEIRA-MAR</small></span></div>
      </div>
    </section>

    <div class="event-strip" id="detalhes">
      <div class="container event-strip-inner">
        <span><Icon name="pin" /> Praia da Pitinga <small>Arraial d’Ajuda</small></span>
        <span><Icon name="calendar" /> Datas sob consulta prévia</span>
        <span><Icon name="clock" /> Horários sob consulta</span>
      </div>
    </div>

    <section id="experiencia" class="experience section-space container" aria-labelledby="experience-title">
      <div class="section-intro"><p class="eyebrow">SIMPLES DE VIVER. DIFÍCIL DE ESQUECER.</p><h2 id="experience-title">Tem momentos que<br />merecem ser <em>sentidos.</em></h2><p>Troque a correria pelo som do mar. Sente-se à mesa, compartilhe sabores e deixe o cenário fazer o resto.</p></div>
      <div class="benefit-grid"><article v-for="(benefit, index) in benefits" :key="benefit.title" class="benefit"><div class="benefit-top"><Icon :name="benefit.icon" /><span>0{{ index + 1 }}</span></div><h3>{{ benefit.title }}</h3><p>{{ benefit.text }}</p></article></div>
    </section>

    <section class="story-section" aria-labelledby="story-title">
      <div class="container story-grid">
        <div class="story-photos">
          <figure class="story-photo-main"><img src="/images/site2-800.webp" srcset="/images/site2-480.webp 480w, /images/site2-800.webp 800w" sizes="(min-width: 900px) 36vw, 78vw" width="800" height="800" loading="lazy" alt="Casal caminhando junto ao mar, em frente às falésias iluminadas pela luz dourada" /></figure>
          <figure class="story-photo-small"><img src="/images/site3-480.webp" width="480" height="480" loading="lazy" alt="Detalhes da mesa de café colonial preparada na areia" /><figcaption>o sabor de estar presente</figcaption></figure>
        </div>
        <div class="story-copy"><p class="eyebrow">PARA DOIS. PARA VOCÊ. PARA LEMBRAR.</p><h2 id="story-title">O melhor registro<br />é o que você <em>vive.</em></h2><p>Entre uma conversa e outra, o mar ao fundo. Entre um sorriso e outro, uma memória nova.</p><p>E para levar um pedacinho desse dia com você, o encontro inclui <strong>5 fotografias profissionais por casal ou indivíduo</strong>, feitas em frente às falésias.</p><a class="text-link" href="#interesse">Quero fazer parte desse encontro</a><span class="story-signature">Nos vemos à beira-mar.</span></div>
      </div>
    </section>

    <section id="interesse" class="reservation-section section-space container" aria-labelledby="reservation-title">
      <div class="reservation-copy"><p class="eyebrow">SEU PRÓXIMO BOM MOMENTO</p><h2 id="reservation-title">Reserve um tempo<br />para o que <em>faz bem.</em></h2><p>Um encontro especial na Praia da Pitinga.<br />Deixe seu contato e saiba como participar.</p><div class="package-price"><span>EXPERIÊNCIA COMPLETA</span><p><small>R$</small> 250<span>,00</span></p><small>Valor do pacote anunciado</small></div><ul class="package-list"><li><Icon name="check" /> Café colonial compartilhado</li><li><Icon name="check" /> Piquenique à beira-mar</li><li><Icon name="check" /> 5 fotografias profissionais</li></ul><p class="availability">Participação sujeita à disponibilidade.</p></div>
      <div ref="formElement" class="form-card">
        <div class="form-card-header"><Icon name="sunset" /><span>UM CONVITE PARA DESACELERAR</span></div>
        <div v-if="status === 'success'" class="success-panel" role="status" aria-live="polite"><span class="success-icon"><Icon name="check" /></span><h3>Seu interesse foi enviado!</h3><p>Aguarde o contato da organização no número informado para consultar a disponibilidade e combinar os detalhes.</p><p class="form-note">Sua reserva será confirmada diretamente com a organização.</p></div>
        <template v-else><h3>Vamos viver esse dia?</h3><p class="form-description">Preencha abaixo e a gente entra em contato com você.</p>
          <form @submit.prevent="submitForm" novalidate :aria-busy="status === 'sending'">
            <div class="field"><label for="name">Seu nome</label><input id="name" v-model="name" name="name" autocomplete="name" placeholder="Como podemos chamar você?" maxlength="100" required :disabled="status === 'sending'" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'name-error' : undefined" /><span v-if="errors.name" id="name-error" class="field-error">{{ errors.name }}</span></div>
            <div class="field"><label for="phone">Seu telefone / WhatsApp</label><input id="phone" :value="phone" @input="formatPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(00) 00000-0000" maxlength="20" required :disabled="status === 'sending'" :aria-invalid="!!errors.phone" :aria-describedby="errors.phone ? 'phone-error' : 'phone-hint'" /><span v-if="errors.phone" id="phone-error" class="field-error">{{ errors.phone }}</span><small v-else id="phone-hint">Inclua o DDD do seu número.</small></div>
            <div class="honeypot" aria-hidden="true"><label for="company">Empresa</label><input id="company" v-model="honeypot" name="_honey" tabindex="-1" autocomplete="off" /></div>
            <button class="button button-primary submit-button" type="submit" :disabled="status === 'sending'"><span v-if="status === 'sending'" class="spinner" aria-hidden="true"></span>{{ status === 'sending' ? 'Enviando seu interesse…' : 'Quero participar' }}</button>
            <div v-if="status === 'error'" class="form-error" role="alert">Não conseguimos confirmar o envio. Seus dados foram mantidos para você tentar novamente. Se preferir, fale com a organização por <a href="mailto:tharciothalles2@gmail.com">e-mail</a>.</div>
            <p class="privacy-note"><Icon name="lock" /> Usaremos seu nome e telefone para entrar em contato sobre este encontro.</p>
            <p class="form-note">Sem pagamento nesta etapa. O envio não garante a reserva.</p>
          </form>
        </template>
      </div>
    </section>

    <section class="faq-section container section-space" aria-labelledby="faq-title"><div><p class="eyebrow">ANTES DE ARRUMAR A BOLSA</p><h2 id="faq-title">Só mais alguns<br /><em>detalhes.</em></h2></div><div class="faq-list"><details v-for="item in questions" :key="item.question"><summary>{{ item.question }}<Icon name="chevron" /></summary><p>{{ item.answer }}</p></details></div></section>
    <div class="closing-line container"><Icon name="heart" /><p>Tem coisas que a gente não leva na mala.<br /><em>Leva na memória.</em></p></div>
  </main>

  <footer class="site-footer"><div class="container footer-inner"><a class="brand" href="#inicio"><Icon name="sunset" class="brand-icon" /><span>Pitinga<span class="brand-subtitle">PIQUENIQUE & MEMÓRIAS</span></span></a><p>Praia da Pitinga · Arraial d’Ajuda, Bahia<br /><span>Um encontro para estar presente.</span></p><details class="privacy-details"><summary>Privacidade</summary><p>Nome e telefone são encaminhados pelo FormSubmit ao e-mail da organização para responder ao seu interesse neste evento. Para solicitar a exclusão ou esclarecer o uso dos seus dados, escreva para <a href="mailto:tharciothalles2@gmail.com">tharciothalles2@gmail.com</a>.</p></details></div><p class="image-disclaimer container">Imagens ilustrativas da experiência. Confirme os detalhes e a disponibilidade com a organização.</p></footer>
  <div v-show="showMobileCta && status !== 'success'" class="mobile-cta"><span>Um momento para você<strong>R$ 250,00 <small>/ pacote</small></strong></span><a class="button button-primary" href="#interesse">Quero participar</a></div>
</template>
