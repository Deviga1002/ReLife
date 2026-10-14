import { Leaf } from 'lucide-react';

const About = () => (
  <div className="container" style={{ maxWidth: 720 }}>
    <div className="page-header text-center">
      <Leaf size={48} color="#16a34a" style={{ margin: '0 auto 12px' }} />
      <h1>About ReLife</h1>
      <p>AI-Powered Circular Community Hub</p>
    </div>
    <div className="card" style={{ padding: '2rem' }}>
      <p style={{ marginBottom: 16, lineHeight: 1.8 }}>
        ReLife is a community platform that helps people donate, sell, repair, recycle, and upcycle
        unused or damaged products such as clothes, books, food, furniture, and electronics.
      </p>
      <p style={{ marginBottom: 16, lineHeight: 1.8 }}>
        Our goal is to reduce waste, encourage reuse, support people in need, and promote sustainable living.
        Every completed donation, recycle, or upcycle action earns reward points and contributes to
        estimated environmental impact metrics.
      </p>
      <h3 style={{ marginBottom: 8 }}>What you can do</h3>
      <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
        <li>List items for donation or sale</li>
        <li>Request free donations from the community</li>
        <li>Submit repair, recycle, and upcycle requests</li>
        <li>Earn reward points for sustainable actions</li>
        <li>Track estimated waste diverted and CO₂ savings</li>
      </ul>
      <p className="text-muted mt-3" style={{ fontSize: '0.9rem' }}>
        Environmental impact figures are estimates based on average item weights and industry factors.
        They are illustrative and not exact measurements.
      </p>
    </div>
  </div>
);

export default About;
