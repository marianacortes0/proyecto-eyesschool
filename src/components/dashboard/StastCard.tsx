interface Props {
  title: string;
  value: string | number;
}

export const StatsCard = ({ title, value }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
};