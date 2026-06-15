import React from 'react';
import './Ticket.css';

export const Ticket: React.FC = () => {
    return (
        <div className="ticket-wrapper">
            <div className="ticket">
                <div className="ticket-main">
                    <div className="cutout-top"></div>
                    <div className="cutout-bottom"></div>

                    <div className="header">
                        <div className="logo-section">
                            <img
                                src="https://aquamarine-rugelach-9646bb.netlify.app/assets/logo%20no%20background%20bigger-Cbz-WS3g.svg"
                                className="logo"
                                alt="Logo"
                            />
                            <div className="logo-text">Sello Saka Foundation</div>
                        </div>
                        <div className="foundation-name">
                            Official<br />Fundraising Ticket
                        </div>
                    </div>

                    <div className="prize-section">
                        <div className="tagline">Support childhood cancer survivors</div>
                        <h1 className="prize-title">WIN A BRAND NEW<br />RENAULT KIGER</h1>
                    </div>

                    <div className="details-grid">
                        <div className="detail-block">
                            <span className="detail-label">Competition Period</span>
                            <span className="detail-value" style={{ fontSize: '11px' }}>01 March 2026 – 29 June 2026</span>
                        </div>
                        <div className="detail-block">
                            <span className="detail-label">Draw Date</span>
                            <span className="detail-value">30 June 2026</span>
                        </div>
                        <div className="detail-block">
                            <span className="detail-label">Entry Price</span>
                            <span className="ticket-price">R100.00</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <span className="detail-label">Ticket Number</span><br />
                        <span className="ticket-number-box">SSKF-2026-000174</span>
                    </div>

                    <div className="terms-banner">
                        <strong>TERMS:</strong> Each ticket equals one entry. Multiple entries allowed. Winner selected via live random draw. Ticket valid only if purchased through authorised Sello Saka Foundation channels.
                    </div>
                </div>

                <div className="ticket-stub">
                    <div className="stub-header">
                        <div className="stub-title">Participant Stub</div>
                        <div className="stub-ref">REF-83XK29L</div>
                    </div>

                    <div className="form-group">
                        <div className="form-label">Participant Name</div>
                        <div className="form-line"></div>
                    </div>
                    <div className="form-group">
                        <div className="form-label">Phone Number</div>
                        <div className="form-line"></div>
                    </div>
                    <div className="form-group">
                        <div className="form-label">Email Address</div>
                        <div className="form-line"></div>
                    </div>

                    <div className="stub-footer">
                        <strong>SSKF-2026-000174</strong><br />
                        sellosaka.care@gmail.com<br />
                        www.sellosakafoundation.org
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ticket;
