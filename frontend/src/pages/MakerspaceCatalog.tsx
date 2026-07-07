import type { MakerspaceCardData } from "../types/types";
import MakerspaceCard from "../components/MakerspaceCard";
// import styles from '../styles/catalog.module.css';
import { useState, useEffect } from "react";
// import supabase from "../lib/supabase";
import Loading from "./Loading";
import SearchIcon from '@mui/icons-material/Search';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Reusable hook for fetching makerspace cards based on search value, limit, and order
const useMakerspaceCatalogData = () => {
  const [makerspaceCards, setMakerspaceCards] = useState<MakerspaceCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [searchLimit, setSearchLimit] = useState(9);
  const [isDescending, setIsDescending] = useState(false);
  const [isOrderedByBuilding, setIsOrderedByBuilding] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchValue(searchValue), 500);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    const fetchMakerspaceCards = async () => {
        try {
          setLoading(true);

          let query = `${VITE_API_BASE_URL}/view-makerspace-cards/?`;

          if (debouncedSearchValue !== "") {
            query += `search=${debouncedSearchValue}&`;
          }

          query += `ordering=${isDescending ? '-' : ''}${isOrderedByBuilding ? 'building' : 'makerspace_name'}&limit=${searchLimit}`;
          
          const response = await fetch(query);

          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }

          const data = await response.json();

          if (!data) {
            throw new Error("Makerspace cards not found");
          }
          
          setMakerspaceCards(data.results);
        }
        catch (e) {
          console.error((e as Error).message);
          setErrorMessage("An error occurred. Please refresh this page.");
        }
        finally {
          setLoading(false);
        }
      };

      fetchMakerspaceCards();
    }, [debouncedSearchValue, searchLimit, isDescending, isOrderedByBuilding]);

    return { searchValue, setSearchValue, searchLimit, setSearchLimit, isDescending, setIsDescending, isOrderedByBuilding, setIsOrderedByBuilding, makerspaceCards, loading, errorMessage };
  };

function MakerspaceCatalog() {
    const { searchValue, setSearchValue, searchLimit, setSearchLimit, isDescending, setIsDescending, isOrderedByBuilding, setIsOrderedByBuilding, makerspaceCards, loading, errorMessage } = useMakerspaceCatalogData();

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
                        <input type="checkbox" checked={isOrderedByBuilding} className="mr-2" onChange={() => setIsOrderedByBuilding((isOrderedByBuilding) => !isOrderedByBuilding)} />
                        Building
                      </label>
                    </div>
                    <div className="text-center absolute left-0 right-0 max-w-[50vw] mx-auto">
                      <h1 className="text-3xl font-medium">U-M Makerspaces</h1>
                      <div className="flex justify-center items-center w-[50vw] mt-6 px-4 rounded-4xl border">
                        <div className="mr-0.5"><SearchIcon /></div>
                        <input type="text" value={searchValue} placeholder="Search makerspaces by name, description, location, equipment, or theme" className="w-full text-4 py-2.5 px-2" onChange={(e) => setSearchValue(e.target.value)} />
                      </div>
                    </div>
                    {
                      makerspaceCards.length > 0 ?
                      <>
                        <div className="grid grid-cols-3 gap-6 max-w-[80vw] mt-40 mb-8 mx-auto">
                          {makerspaceCards.map((makerspaceCard) => <MakerspaceCard key={makerspaceCard["makerspace_id"]} makerspaceCard={makerspaceCard} /> )}
                        </div>
                        <p className="text-center mt-16 mb-12">Results 1-{makerspaceCards.length}</p>
                        {
                          makerspaceCards.length === searchLimit &&
                          <button type="button" className="block mx-auto bg-arb-blue text-[#fff] py-3 px-5 rounded-3xl hover:bg-arb-blue-hover cursor-pointer" onClick={() => setSearchLimit((searchLimit) => searchLimit + 9)}>See More</button>
                        }
                      </> :
                      <p className="text-center mt-32">No results found.</p>
                    }
                </div>
            }
        </>
    );
}

export default MakerspaceCatalog;