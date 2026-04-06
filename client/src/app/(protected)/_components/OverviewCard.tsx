/* eslint-disable @typescript-eslint/no-explicit-any */

const OverviewCard = ({ item }: { item: any }) => {
  return (
    <article className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 text-base font-medium text-gray-700">{item.title}</div>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-semibold text-gray-900 lg:text-5xl">
          {item.value}
        </p>
      </div>
    </article>
  );
};

export default OverviewCard;
