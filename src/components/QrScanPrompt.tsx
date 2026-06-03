type Props = {
  dataUrl: string
  title?: string
  hint?: string
}

/** QR grande com animação de escaneamento — uso em totem */
export default function QrScanPrompt({
  dataUrl,
  title = 'Acompanhe seu pedido',
  hint = 'Aponte a câmera do celular',
}: Props) {
  return (
    <div className="qr-scan-prompt" role="region" aria-label={title}>
      <p className="qr-scan-prompt__title">{title}</p>
      <p className="qr-scan-prompt__hint">{hint}</p>

      <div className="qr-scan-prompt__stage">
        <div className="qr-scan-prompt__frame" aria-hidden>
          <span className="qr-scan-corner qr-scan-corner--tl" />
          <span className="qr-scan-corner qr-scan-corner--tr" />
          <span className="qr-scan-corner qr-scan-corner--bl" />
          <span className="qr-scan-corner qr-scan-corner--br" />
          <span className="qr-scan-line" />
          <div className="qr-scan-prompt__code">
            <img src={dataUrl} alt="QR Code para acompanhar o pedido" width={220} height={220} />
          </div>
        </div>

        <div className="qr-scan-phone" aria-hidden>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
            <rect x="9" y="5" width="6" height="9" rx="1" fill="currentColor" opacity="0.35" />
          </svg>
          <span className="qr-scan-phone__beam" />
        </div>
      </div>

      <p className="qr-scan-prompt__action">
        <span className="qr-scan-prompt__pulse-dot" aria-hidden />
        Escaneie o QR Code
      </p>

      <style>{`
        .qr-scan-prompt {
          width: 100%;
          text-align: center;
        }
        .qr-scan-prompt__title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--t3);
        }
        .qr-scan-prompt__hint {
          margin: 0 0 20px;
          font-size: 20px;
          font-weight: 600;
          color: var(--t1);
        }
        .qr-scan-prompt__stage {
          position: relative;
          display: inline-block;
          margin: 0 auto 16px;
          padding: 0 12px 8px 0;
        }
        .qr-scan-prompt__frame {
          position: relative;
          width: 268px;
          height: 268px;
          margin: 0 auto;
        }
        .qr-scan-prompt__frame::before {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 22px;
          border: 2px solid rgba(192, 39, 45, 0.35);
          animation: qrRingPulse 2.4s ease-in-out infinite;
          pointer-events: none;
        }
        .qr-scan-prompt__code {
          position: absolute;
          inset: 24px;
          background: #fff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
        }
        .qr-scan-prompt__code img {
          display: block;
          width: 220px;
          height: 220px;
        }
        .qr-scan-corner {
          position: absolute;
          width: 36px;
          height: 36px;
          border: 4px solid var(--primary);
          animation: qrCornerPulse 1.6s ease-in-out infinite;
        }
        .qr-scan-corner--tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 10px 0 0 0; }
        .qr-scan-corner--tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 10px 0 0; animation-delay: .2s; }
        .qr-scan-corner--bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 10px; animation-delay: .4s; }
        .qr-scan-corner--br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 10px 0; animation-delay: .6s; }
        .qr-scan-line {
          position: absolute;
          left: 20px;
          right: 20px;
          height: 4px;
          border-radius: 4px;
          background: linear-gradient(90deg, transparent, var(--primary) 20%, #ff8a8a 50%, var(--primary) 80%, transparent);
          box-shadow: 0 0 16px rgba(192, 39, 45, 0.75);
          animation: qrScanSweep 2.2s ease-in-out infinite;
          z-index: 2;
          pointer-events: none;
        }
        .qr-scan-phone {
          position: absolute;
          right: -4px;
          bottom: 4px;
          color: var(--accent);
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
          animation: qrPhoneScan 2.8s ease-in-out infinite;
        }
        .qr-scan-phone__beam {
          position: absolute;
          left: 50%;
          top: 6px;
          width: 2px;
          height: 28px;
          margin-left: -1px;
          background: linear-gradient(180deg, var(--primary), transparent);
          transform-origin: top center;
          animation: qrPhoneBeam 2.8s ease-in-out infinite;
          opacity: 0.85;
        }
        .qr-scan-prompt__action {
          margin: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 600;
          color: var(--t2);
        }
        .qr-scan-prompt__pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--primary);
          flex-shrink: 0;
          animation: qrDotPulse 1.2s ease-in-out infinite;
        }

        @keyframes qrScanSweep {
          0%, 100% { top: 18px; opacity: 0.5; }
          50% { top: calc(100% - 22px); opacity: 1; }
        }
        @keyframes qrCornerPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes qrRingPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        @keyframes qrPhoneScan {
          0%, 100% { transform: translate(14px, 10px) rotate(-8deg); }
          45% { transform: translate(-28px, -36px) rotate(-4deg); }
          55% { transform: translate(-30px, -38px) rotate(-2deg) scale(0.96); }
        }
        @keyframes qrPhoneBeam {
          0%, 100% { transform: scaleY(0.4); opacity: 0.3; }
          45%, 55% { transform: scaleY(1.15); opacity: 1; }
        }
        @keyframes qrDotPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.35); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
