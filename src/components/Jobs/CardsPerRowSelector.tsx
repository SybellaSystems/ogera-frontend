import React from "react";

type CardsPerRow = 2 | 3;

interface CardsPerRowSelectorProps {
  cardsPerRow: CardsPerRow;
  setCardsPerRow: React.Dispatch<React.SetStateAction<CardsPerRow>>;
}

const CardsPerRowSelector: React.FC<CardsPerRowSelectorProps> = ({
  cardsPerRow,
  setCardsPerRow,
}) => {
  return (
    <div className="hidden lg:flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700">
        Cards per row:
      </span>

      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1.5">
        {/* 2 Cards */}
        <button
          type="button"
          onClick={() => setCardsPerRow(2)}
          aria-label="2 cards per row"
          title="2 cards per row"
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
            cardsPerRow === 2
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="3"
              width="7"
              height="6"
              rx="0.8"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="11"
              y="3"
              width="7"
              height="6"
              rx="0.8"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="2"
              y="11"
              width="7"
              height="6"
              rx="0.8"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="11"
              y="11"
              width="7"
              height="6"
              rx="0.8"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </button>

        {/* 3 Cards */}
        <button
          type="button"
          onClick={() => setCardsPerRow(3)}
          aria-label="3 cards per row"
          title="3 cards per row"
          className={`w-11 h-11 flex items-center justify-center rounded-lg transition-all ${
            cardsPerRow === 3
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="3"
              width="4.5"
              height="6"
              rx="0.7"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="7.75"
              y="3"
              width="4.5"
              height="6"
              rx="0.7"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="13.5"
              y="3"
              width="4.5"
              height="6"
              rx="0.7"
              stroke="currentColor"
              strokeWidth="1.3"
            />

            <rect
              x="2"
              y="11"
              width="4.5"
              height="6"
              rx="0.7"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="7.75"
              y="11"
              width="4.5"
              height="6"
              rx="0.7"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="13.5"
              y="11"
              width="4.5"
              height="6"
              rx="0.7"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CardsPerRowSelector;