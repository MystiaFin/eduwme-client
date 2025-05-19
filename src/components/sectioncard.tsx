interface SectionCardProps {
  title: string;
  exp: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, exp }) => {
  return (
    <main>
      <h2>{title}</h2>
      <p>{exp}</p>
    </main>
  );
};

export default SectionCard;
