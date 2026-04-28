import { ObjectId } from "mongodb";
import { getCollections } from "@/lib/mongo/collections";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedToatPage({ params }: PageProps) {
  const { token } = await params;
  const { acl, toats } = await getCollections();
  const share = await acl.findOne({ token });
  const toatId = share?.toatId instanceof ObjectId ? share.toatId : null;
  const toat = toatId ? await toats.findOne({ _id: toatId }) : null;

  if (!share || !toat) {
    return (
      <main style={styles.page}>
        <section style={styles.card}>
          <p style={styles.eyebrow}>Shared toat</p>
          <h1 style={styles.title}>This link is not available.</h1>
          <p style={styles.body}>Ask the sender to share the toat again.</p>
        </section>
      </main>
    );
  }

  const datetime = toat.datetime instanceof Date ? toat.datetime : null;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.eyebrow}>Shared toat</p>
        <h1 style={styles.title}>{typeof toat.title === "string" ? toat.title : "Untitled toat"}</h1>
        {datetime ? <p style={styles.meta}>{datetime.toLocaleString()}</p> : null}
        {typeof toat.location === "string" && toat.location ? <p style={styles.meta}>{toat.location}</p> : null}
        {typeof toat.notes === "string" && toat.notes ? <p style={styles.body}>{toat.notes}</p> : null}
        <a style={styles.button} href={`/login?next=/j/${encodeURIComponent(token)}`}>Accept in Toatre</a>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "linear-gradient(180deg, #FBFAFF, #F7F5FF)",
  },
  card: {
    width: "min(100%, 560px)",
    borderRadius: 28,
    border: "1px solid rgba(255,255,255,0.9)",
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 28px 80px rgba(31,41,55,0.10)",
    padding: 28,
  },
  eyebrow: { margin: "0 0 8px", color: "#5B3DF5", fontSize: 12, fontWeight: 800, textTransform: "uppercase" as const },
  title: { margin: "0 0 14px", color: "#111827", fontSize: 34, lineHeight: 1.04 },
  meta: { margin: "8px 0", color: "#4B5563", fontSize: 16 },
  body: { margin: "16px 0", color: "#374151", lineHeight: 1.6 },
  button: {
    display: "inline-flex",
    marginTop: 12,
    padding: "14px 18px",
    borderRadius: 16,
    background: "linear-gradient(135deg, #7C3AED, #5B3DF5)",
    color: "#FFFFFF",
    fontWeight: 800,
    textDecoration: "none",
  },
};