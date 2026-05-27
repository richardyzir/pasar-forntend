export default function Loading({ text = "Memuat..." }) {
  return (
    <div className="loading-page">
      <span className="spinner spinner-lg" />
      <p className="text-gray">{text}</p>
    </div>
  );
}
