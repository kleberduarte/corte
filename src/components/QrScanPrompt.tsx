type Props = {
  dataUrl: string
  title?: string
  hint?: string
  /** Repete a instrução abaixo do QR; desligue quando o hint já aparece acima */
  showAction?: boolean
}

/** QR com animação de celular apontando — totem 21" */
export default function QrScanPrompt({
  dataUrl,
  title = 'Acompanhe seu pedido',
  hint = 'Aponte a câmera do celular para o QR Code',
  showAction = true,
}: Props) {
  return (
    <div className="qr-scan-prompt" role="region" aria-label={title}>
      <p className="qr-scan-prompt__title">{title}</p>
      <p className="qr-scan-prompt__hint">{hint}</p>

      <div className="qr-scan-prompt__stage">
        {/* Glow de fundo pulsante */}
        <span className="qr-scan-beam-glow" aria-hidden />

        {/* Flash de leitura bem-sucedida */}
        <span className="qr-scan-success-flash" aria-hidden />

        {/* Frame do QR com cantos e linha de varredura */}
        <div className="qr-scan-prompt__frame" aria-hidden>
          <span className="qr-scan-corner qr-scan-corner--tl" />
          <span className="qr-scan-corner qr-scan-corner--tr" />
          <span className="qr-scan-corner qr-scan-corner--bl" />
          <span className="qr-scan-corner qr-scan-corner--br" />
          <span className="qr-scan-line" />
          <div className="qr-scan-prompt__code">
            <img src={dataUrl} alt="QR Code para acompanhar o pedido" />
          </div>
        </div>

        {/* Celular animado apontando para o QR */}
        <div className="qr-scan-phone-scene" aria-hidden>
          {/* Seta de direção: celular → QR (aponta para cima) */}
          <svg className="qr-scan-arrow" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 40V8M24 8L14 20M24 8L34 20" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {/* Celular em perspectiva 3/4 — câmera visível nas costas */}
          <svg viewBox="0 0 140 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sombra do celular */}
            <ellipse cx="70" cy="208" rx="42" ry="8" fill="rgba(0,0,0,0.35)" />

            {/* Corpo do celular (costas) */}
            <rect x="18" y="10" width="104" height="190" rx="18" fill="#1C1C22" stroke="#3A3A48" strokeWidth="2.5" />

            {/* Painel de vidro das costas */}
            <rect x="22" y="14" width="96" height="182" rx="15" fill="#222230" />

            {/* Reflexo sutil */}
            <rect x="22" y="14" width="96" height="60" rx="15" fill="url(#glassShine)" opacity="0.2" />
            <defs>
              <linearGradient id="glassShine" x1="22" y1="14" x2="118" y2="74" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" stopOpacity="0.5" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
                <stop stopColor="var(--primary)" stopOpacity="0.9" />
                <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Módulo de câmera — destaque */}
            <rect x="30" y="26" width="56" height="56" rx="14" fill="#111118" stroke="#2E2E3E" strokeWidth="2" />

            {/* Lente principal */}
            <circle cx="58" cy="48" r="18" fill="#0A0A12" stroke="#2A2A38" strokeWidth="2" />
            <circle cx="58" cy="48" r="13" fill="#050508" />
            <circle cx="58" cy="48" r="9" fill="#0D0D1A" />
            {/* Brilho da lente */}
            <circle cx="53" cy="43" r="3.5" fill="#fff" opacity="0.12" />
            <circle cx="63" cy="53" r="1.5" fill="#fff" opacity="0.07" />

            {/* Lente secundária */}
            <circle cx="72" cy="68" r="9" fill="#0A0A12" stroke="#2A2A38" strokeWidth="1.5" />
            <circle cx="72" cy="68" r="6" fill="#050508" />
            <circle cx="70" cy="66" r="2" fill="#fff" opacity="0.1" />

            {/* Flash LED */}
            <rect x="30" y="62" width="12" height="8" rx="4" fill="#222238" stroke="#2E2E3E" strokeWidth="1" />
            <rect x="32" y="64" width="8" height="4" rx="2" fill="#FFE5A0" opacity="0.6">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="4.8s" begin="2.8s" repeatCount="indefinite" />
            </rect>

            {/* Feixe de laser saindo da câmera — aponta para o QR */}
            <line className="qr-camera-laser" x1="58" y1="48" x2="58" y2="4" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" opacity="0">
              <animate attributeName="opacity" values="0;0;0;0.9;0.9;0.9;0.3;0" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.3;0.45;0.5;0.6;0.7;0.8;1" />
              <animate attributeName="strokeWidth" values="2;2;2;4;4;3;2;2" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.3;0.45;0.5;0.6;0.7;0.8;1" />
            </line>
            <polygon points="48,4 58,0 68,4" fill="var(--primary)" opacity="0">
              <animate attributeName="opacity" values="0;0;0;1;1;1;0.3;0" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.3;0.45;0.5;0.6;0.7;0.8;1" />
            </polygon>

            {/* Viewfinder no módulo — aparece ao escanear */}
            <rect x="38" y="28" width="14" height="14" rx="3" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0">
              <animate attributeName="opacity" values="0;0;0;1;1;1;0;0" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.3;0.45;0.5;0.62;0.72;0.78;1" />
            </rect>
            <rect x="38" y="28" width="14" height="14" rx="3" fill="var(--primary)" opacity="0">
              <animate attributeName="opacity" values="0;0;0;0;0.18;0;0;0" dur="4.8s" repeatCount="indefinite" keyTimes="0;0.3;0.45;0.5;0.62;0.7;0.78;1" />
            </rect>

            {/* Botão lateral */}
            <rect x="114" y="60" width="6" height="28" rx="3" fill="#2A2A38" />

            {/* Porta de carregamento */}
            <rect x="56" y="196" width="28" height="6" rx="3" fill="#2A2A38" />
          </svg>
        </div>

        {/* Feixe da câmera ao QR (CSS) */}
        <span className="qr-scan-beam" />
      </div>

      {showAction && (
        <p className="qr-scan-prompt__action">
          <span className="qr-scan-prompt__pulse-dot" aria-hidden />
          {hint}
        </p>
      )}
    </div>
  )
}
