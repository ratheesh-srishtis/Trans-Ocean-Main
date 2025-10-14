<div className="d-flex justify-content-between headerb mb-3 mt-3 ">
  <div className="leftside">
    <ul className="nav nav-underline gap-4 ">
      <li className="nav-item nav-item-filter">
        <a
          className="nav-link carduppercontent"
          aria-current="page"
          onClick={() => fetchQuotations("all")}
        >
          All
        </a>
      </li>
      <li className="nav-item nav-item-filter">
        <a
          className="nav-link carduppercontent"
          onClick={() => fetchQuotations("day")}
        >
          Last 24 Hour
        </a>
      </li>
      <li className="nav-item nav-item-filter">
        <a
          className="nav-link carduppercontent"
          onClick={() => fetchQuotations("week")}
        >
          Last Week
        </a>
      </li>
      <li className="nav-item nav-item-filter">
        <a
          className="nav-link carduppercontentlast"
          onClick={() => fetchQuotations("month")}
        >
          Last Month
        </a>
      </li>
    </ul>
  </div>

  <div className="d-flex gap-3 rightside">
    <div className="">
      <input
        type="email"
        className="form-control search"
        id="exampleFormControlInput1"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
      />
      <i className="bi bi-search searchicon"></i>
    </div>
    <div className="">
      <i className="bi bi-funnel-fill filtericon"></i>
      <select
        className="form-select form-select-sm filter"
        aria-label="Small select example"
        name="status"
        onChange={handleSelectChange}
        value={selectedStatus}
      >
        <option value="">All</option>
        {statusList?.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
    <div className=" createbtn">
      <button
        type="button"
        onClick={() => handleNavigation()}
        className="btn btn-info infobtn"
      >
        Create New PDA
      </button>
    </div>
  </div>
</div>;
