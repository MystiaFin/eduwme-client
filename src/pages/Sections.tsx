import SectionCard from "@/components/sectioncard";

const SectionPage = () => {
  const data = [
    {
      id: 1,
      title: "Section 1",
      exp: 10,
    },
    {
      id: 2,
      title: "Section 2",
      exp: 10,
    },
  ];

  return (
    <main>
      <section>
        {data.map((list) => (
          <SectionCard key={list.id} title={list.title} exp={list.exp} />
        ))}
      </section>
    </main>
  );
};

export default SectionPage;
