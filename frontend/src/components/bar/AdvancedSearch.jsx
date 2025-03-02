
import { BiCategory } from 'react-icons/bi';
import { FaRegClock, FaFire, FaSortAmountDown } from 'react-icons/fa';

const AdvancedSearch = ({
    handleCategoryChange,
    handleSortChange,
    activeCategory,
    filters,
    isFilterOpen
}) => {

    return (
        < div className={`lg:block bg-white dark:bg-gray-800 rounded-xl shadow p-6 h-fit ${isFilterOpen ? 'block' : 'hidden'}`
        }>
            {/* Categories */}
            < div className="mb-6" >
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <BiCategory className="mr-2" /> Categories
                </h3>
                <div className="space-y-2">
                    {['featured', 'recent', 'trending'].map((category) => (
                        <button
                            key={category}
                            className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${activeCategory === category
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category === 'featured' && <FaSortAmountDown className="inline mr-2" />}
                            {category === 'recent' && <FaRegClock className="inline mr-2" />}
                            {category === 'trending' && <FaFire className="inline mr-2" />}
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div >

            {/* Sort options */}
            < div >
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <FaSortAmountDown className="mr-2" /> Sort By
                </h3>
                <div className="space-y-2">
                    {[
                        { id: 'newest', name: 'Most Recent' },
                        { id: 'views', name: 'Most Popular' }
                    ].map((sort) => (
                        <button
                            key={sort.id}
                            className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${filters.sortBy === sort.id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            onClick={() => handleSortChange(sort.id)}
                        >
                            {sort.name}
                        </button>
                    ))}
                </div>
            </div >
        </div >
    )
}


export default AdvancedSearch;