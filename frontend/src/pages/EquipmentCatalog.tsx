// import styles from '../styles/catalog.module.css';
import { useState, useEffect } from 'react';
import type { EquipmentCardData } from '../types/types';
import { apiGetList } from '../lib/api';
import EquipmentCard from '../components/EquipmentCard';
import Loading from './Loading';
import SearchIcon from '@mui/icons-material/Search';

// Reusable hook for fetching equipment cards based on search value, limit, and order
const useEquipmentCatalogData = () => {
  const [equipmentCards, setEquipmentCards] = useState<EquipmentCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [searchLimit, setSearchLimit] = useState(20);
  const [isDescending, setIsDescending] = useState(false);
  const [isOrderedByModelName, setIsOrderedByModelName] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchValue(searchValue), 500);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    const fetchEquipmentCards = async () => {
        try {
          setLoading(true);

          const cards = await apiGetList<EquipmentCardData>('/view-equipment-cards/', {
            search: debouncedSearchValue || undefined,
            ordering: `${isDescending ? '-' : ''}${isOrderedByModelName ? 'equipment_model_name' : 'equipment_type'}`,
            limit: searchLimit,
          });

          setEquipmentCards(cards);
        }
        catch (e) {
          console.error((e as Error).message);
          setErrorMessage("An error occurred. Please refresh this page.");
        }
        finally {
          setLoading(false);
        }
      };

      fetchEquipmentCards();
    }, [debouncedSearchValue, searchLimit, isDescending, isOrderedByModelName]);

    return { searchValue, setSearchValue, searchLimit, setSearchLimit, isDescending, setIsDescending, isOrderedByModelName, setIsOrderedByModelName, equipmentCards, loading, errorMessage };
  };

function EquipmentCatalog() {
    const { searchValue, setSearchValue, searchLimit, setSearchLimit, isDescending, setIsDescending, isOrderedByModelName, setIsOrderedByModelName, equipmentCards, loading, errorMessage } = useEquipmentCatalogData();

    return (
        <>
            {
                loading ? <div className="h-[80vh]"><Loading /></div> :
                errorMessage ? <p className="text-center mt-[35vh]">{errorMessage}</p> :
                <div className="p-14">
                    <div className="absolute left-12">
                      <h3 className="text-xl font-medium">Filters</h3>
                      <label className="flex items-center my-1">
                        <input type="checkbox" checked={isDescending} className="mr-2" onChange={() => setIsDescending((isDescending) => !isDescending)} />
                        Reverse Alphabetical
                      </label>
                      <label className="flex items-center my-1">
                        <input type="checkbox" checked={isOrderedByModelName} className="mr-2" onChange={() => setIsOrderedByModelName((isOrderedByModelName) => !isOrderedByModelName)} />
                        Model Name
                      </label>
                    </div>
                    <div className="text-center absolute left-0 right-0 max-w-[50vw] mx-auto">
                      <h1 className="text-3xl font-medium">U-M Equipment</h1>
                      <div className="flex justify-center items-center w-[50vw] mt-6 px-4 rounded-4xl border">
                        <div className="mr-0.5"><SearchIcon /></div>
                        <input type="text" value={searchValue} placeholder="Search equipment by model, make, type, function, material, or location" className="w-full text-4 py-2.5 px-2" onChange={(e) => setSearchValue(e.target.value)} />
                      </div>
                    </div>
                    {
                      equipmentCards.length > 0 ?
                      <>
                        <div className="grid grid-cols-4 gap-4 max-w-[80vw] mt-38 mb-8 mx-auto">
                          {equipmentCards.map((equipmentCard) => <EquipmentCard key={equipmentCard["equipment_id"]} equipmentCard={equipmentCard} />)}
                        </div>
                        <p className="text-center mt-16 mb-12">Results 1-{equipmentCards.length}</p>
                        {
                          equipmentCards.length == searchLimit &&
                          <button type="button" className="block mx-auto bg-arb-blue text-[#fff] py-3 px-5 rounded-3xl hover:bg-arb-blue-hover cursor-pointer" onClick={() => setSearchLimit((searchLimit) => searchLimit + 20)}>See More</button>
                        }
                      </> :
                      <p className="text-center mt-32">No results found.</p>
                    }
                </div>
            }
        </>
    );
}

export default EquipmentCatalog;