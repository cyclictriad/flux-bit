import { BiSearch } from 'react-icons/bi';

const SearchCombo = ({ searchInputValue, setSearchInputValue, handleSearch }) => (
    <form onSubmit={handleSearch} className="relative">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder="Search videos by title or description..."
                className="block w-full pl-10 pr-24 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <button
                    type="submit"
                    className="px-4 font-medium text-sm inline-flex items-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                    Search
                </button>
            </div>
        </div>
    </form>
);

export default SearchCombo;
