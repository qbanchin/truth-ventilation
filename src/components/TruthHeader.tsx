
const TruthHeader = () => {
  return (
    <header className="text-center mb-12 animate-fadeIn">
      <h1 className="text-4xl font-bold text-foreground mb-4">Say The Truth</h1>
      <div className="space-y-6">
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A safe and anonymous space where you can share your deepest confessions, hidden secrets, and unfiltered thoughts.
        </p>
        <div className="prose prose-sm max-w-2xl mx-auto text-muted-foreground">
          <p>
            Whether it's about relationships, personal struggles, societal pressures, or even those quirky habits you've never told anyone about, this is your platform to speak your truth without judgment. AI-powered fact-checking helps ensure shared information is accurate and reliable.
          </p>
          <p>
            Here, every voice matters, and every truth has a place. Join us and be part of a community that values authenticity, connection, and the courage to be real.
          </p>
        </div>
      </div>
    </header>
  );
};

export default TruthHeader;
