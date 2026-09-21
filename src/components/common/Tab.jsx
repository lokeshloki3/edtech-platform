export default function Tab({ tabData, field, setField }) {
  return (
    <div
      style={{
        boxShadow: 'inset 0px -1px 0px rgba(255, 255, 255, 0.18)',
      }}
      className="bg-global-bg-surface my-6 flex max-w-max gap-x-1 rounded-full p-1"
    >
      {tabData.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setField(tab.type)}
          className={`${
            field === tab.type
              ? 'bg-global-bg text-global-text-primary'
              : 'text-global-text-tertiary bg-transparent'
          } cursor-pointer rounded-full px-5 py-2 transition-all duration-200`}
        >
          {tab?.tabName}
        </button>
      ))}
    </div>
  );
}
