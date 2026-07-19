import { useDebouncedCallback } from "use-debounce";
import { Button, Icon } from "../../../../components/Component";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

const Search = ({ onSearch, setonSearch, placeholder }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const handleChange = useDebouncedCallback((text) => {
    let params = new URLSearchParams(searchParams);
    if (text) {
      params.set("search", text);
    } else {
      params.delete("search");
    }
    navigate(`${pathname}?${params.toString()}`, { replace: true });
  }, 500);

  return (
    <div className={`card-search search-wrap ${onSearch && "active"}`}>
      <div className="search-content">
        <Button
          onClick={() => {
            setonSearch(false);
            searchParams.delete("search");
            setSearchParams(searchParams);
          }}
          className="search-back btn-icon toggle-search"
        >
          <Icon name="arrow-left"></Icon>
        </Button>
        <input
          type="text"
          className="border-transparent form-focus-none form-control"
          placeholder={`Search by ${placeholder}`}
          defaultValue={searchParams.get("search")?.toString()}
          onChange={(e) => handleChange(e.target.value)}
        />
        <Button className="search-submit btn-icon">
          <Icon name="search"></Icon>
        </Button>
      </div>
    </div>
  );
};

export default Search;
