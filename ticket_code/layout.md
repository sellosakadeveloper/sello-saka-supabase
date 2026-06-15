---
pdf_options:
  format: A4
  margin:
    top: 20mm
    right: 20mm
    bottom: 20mm
    left: 20mm
  printBackground: true
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #121F2B;
  background-color: #FFFFFF;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.ticket-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.ticket {
  display: flex;
  width: 100%;
  max-width: 800px;
  height: 320px;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: #FFFFFF;
  position: relative;
}

.ticket-main {
  flex: 1;
  padding: 32px;
  position: relative;
  background: white;
  border-right: 2px dashed #CBD5E1;
}

/* Semi-circles for the perforated edge effect */
.cutout-top, .cutout-bottom {
  position: absolute;
  right: -12.5px;
  width: 25px;
  height: 25px;
  background-color: white; /* same as page background to look transparent */
  border-radius: 50%;
  border: 1px solid #E2E8F0;
  z-index: 10;
}
.cutout-top { top: -13px; transform: rotate(45deg); border-bottom-color: transparent; border-right-color: transparent; }
.cutout-bottom { bottom: -13px; transform: rotate(-45deg); border-top-color: transparent; border-right-color: transparent; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.logo {
  height: 50px;
  object-fit: contain;
}

.foundation-name {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748B;
  font-weight: 700;
  text-align: right;
}

.prize-section {
  margin-bottom: 24px;
}

.tagline {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 16px;
  color: #2D4958;
  margin-bottom: 4px;
}

.prize-title {
  font-size: 36px;
  font-weight: 800;
  color: #121F2B;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -0.5px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-block {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #64748B;
  font-weight: 600;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #121F2B;
}

.ticket-number-box {
  background-color: #F1F5F9;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #2D4958;
  display: inline-block;
  border: 1px solid #E2E8F0;
}

.ticket-price {
  font-size: 24px;
  font-weight: 800;
  color: #2D4958;
}

.terms-banner {
  font-size: 9px;
  color: #94A3B8;
  line-height: 1.4;
  border-top: 1px solid #F1F5F9;
  padding-top: 12px;
}

.ticket-stub {
  width: 260px;
  background-color: #2D4958;
  color: #FFFFFF;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
}

.stub-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.stub-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  margin-bottom: 8px;
}

.stub-ref {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #FFFFFF;
}

.form-group {
  margin-bottom: 20px;
}

.form-line {
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 4px;
  min-height: 20px;
}

.form-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
}

.stub-footer {
  margin-top: auto;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}
.stub-footer strong {
  color: white;
}
</style>

<div class="ticket-wrapper">
  <div class="ticket">
    <div class="ticket-main">
      <div class="cutout-top"></div>
      <div class="cutout-bottom"></div>
      
      <div class="header">
        <img src="https://aquamarine-rugelach-9646bb.netlify.app/assets/logo%20no%20background%20bigger-Cbz-WS3g.svg" class="logo" alt="Logo" />
        <div class="foundation-name">
          Official<br>Fundraising Ticket
        </div>
      </div>

      <div class="prize-section">
        <div class="tagline">Support childhood cancer survivors</div>
        <h1 class="prize-title">WIN A BRAND NEW<br>RENAULT KIGER</h1>
      </div>

      <div class="details-grid">
        <div class="detail-block">
          <span class="detail-label">Competition Period</span>
          <span class="detail-value" style="font-size: 11px;">01 Mar – 29 Jun 2026</span>
        </div>
        <div class="detail-block">
          <span class="detail-label">Draw Date</span>
          <span class="detail-value">30 June 2026</span>
        </div>
        <div class="detail-block">
          <span class="detail-label">Entry Price</span>
          <span class="ticket-price">R100.00</span>
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
          <span class="detail-label">Ticket Number</span><br/>
          <span class="ticket-number-box">SSKF-2026-000174</span>
      </div>

      <div class="terms-banner">
        <strong>TERMS:</strong> Valid only if purchased through authorised channels. Live random draw. Multiple entries allowed. Each ticket equals one entry. See sellosakafoundation.org for full details.
      </div>
    </div>

    <div class="ticket-stub">
      <div class="stub-header">
        <div class="stub-title">Participant Stub</div>
        <div class="stub-ref">REF-83XK29L</div>
      </div>

      <div class="form-group">
        <div class="form-label">Name</div>
        <div class="form-line"></div>
      </div>
      <div class="form-group">
        <div class="form-label">Phone Number</div>
        <div class="form-line"></div>
      </div>
      <div class="form-group">
        <div class="form-label">Email Address</div>
        <div class="form-line"></div>
      </div>

      <div class="stub-footer">
        <strong>SSKF-2026-000174</strong><br>
        sellosaka.care@gmail.com
      </div>
    </div>
  </div>
</div>
