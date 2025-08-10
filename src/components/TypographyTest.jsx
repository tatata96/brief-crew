import React from 'react';

const TypographyTest = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="typography--h0">H0 - Poppins Bold</h1>
      <h1 className="typography--h1">H1 - Poppins Bold</h1>
      <h2 className="typography--h2">H2 - Poppins Bold</h2>
      <h3 className="typography--h3">H3 - Poppins SemiBold</h3>
      <h4 className="typography--h4">H4 - Poppins SemiBold</h4>
      <h4 className="typography--h4-mono">H4 Mono - Anonymous Pro</h4>
      <h5 className="typography--h5">H5 - Space Grotesk Regular</h5>
      <h5 className="typography--h5-medium">H5 Medium - Space Grotesk Medium</h5>
      <p className="typography--heading-mono">Heading Mono - Anonymous Pro</p>
      
      <div style={{ marginTop: '40px' }}>
        <p className="typography--body">Body - Space Grotesk Regular</p>
        <p className="typography--body-semibold">Body Semibold - Space Grotesk Semibold</p>
        <p className="typography--body-mono">Body Mono - Anonymous Pro</p>
        <p className="typography--body-small">Body Small - Space Grotesk Regular</p>
        <p className="typography--body-large">Body Large - Space Grotesk Regular</p>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <p className="typography--subhead">Subhead - Space Grotesk Regular</p>
        <p className="typography--subhead-semibold">Subhead Semibold - Space Grotesk Semibold</p>
        <p className="typography--subhead-mono">Subhead Mono - Anonymous Pro</p>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <p className="typography--paragraph">Paragraph - Space Grotesk Regular with longer line height for better readability.</p>
        <p className="typography--paragraph-small">Paragraph Small - Space Grotesk Regular</p>
        <p className="typography--tagline">Tagline - Space Grotesk Medium</p>
      </div>
      
      {/* Dirtyline 36days Typography Examples */}
      <div style={{ marginTop: '40px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
        <h3>Dirtyline 36days Typography</h3>
        <p className="typography--dirtyline-display">Display - Dirtyline 36days</p>
        <p className="typography--dirtyline-heading">Heading - Dirtyline 36days</p>
        <p className="typography--dirtyline-subheading">Subheading - Dirtyline 36days</p>
        <p className="typography--dirtyline-body">Body - Dirtyline 36days</p>
        <p className="typography--dirtyline-small">Small - Dirtyline 36days</p>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <p className="typography--body color--text-main">Main Text Color</p>
        <p className="typography--body color--text-gray">Gray Text Color</p>
        <p className="typography--body color--text-gray-lighter">Lighter Gray Text Color</p>
        <p className="typography--body color--text-link">Link Text Color</p>
        <p className="typography--body color--text-danger">Danger Text Color</p>
      </div>
      
      {/* Italic Examples */}
      <div style={{ marginTop: '40px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
        <h3>Italic Variants</h3>
        <p style={{ fontFamily: 'var(--font-family--primary)', fontStyle: 'italic', fontSize: '24px', fontWeight: '400' }}>
          Poppins Regular Italic
        </p>
        <p style={{ fontFamily: 'var(--font-family--primary)', fontStyle: 'italic', fontSize: '20px', fontWeight: '500' }}>
          Poppins Medium Italic
        </p>
        <p style={{ fontFamily: 'var(--font-family--primary)', fontStyle: 'italic', fontSize: '18px', fontWeight: '600' }}>
          Poppins SemiBold Italic
        </p>
        <p style={{ fontFamily: 'var(--font-family--primary)', fontStyle: 'italic', fontSize: '16px', fontWeight: '700' }}>
          Poppins Bold Italic
        </p>
        <p style={{ fontFamily: 'var(--font-family--mono)', fontStyle: 'italic', fontSize: '14px', fontWeight: '400' }}>
          Anonymous Pro Regular Italic
        </p>
        <p style={{ fontFamily: 'var(--font-family--mono)', fontStyle: 'italic', fontSize: '14px', fontWeight: '700' }}>
          Anonymous Pro Bold Italic
        </p>
      </div>
    </div>
  );
};

export default TypographyTest; 