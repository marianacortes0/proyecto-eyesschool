type Props = {
  title: string;
  value: number | string;
};

export default function KPICard({ title, value }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}