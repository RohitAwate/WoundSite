/*
SEARCH ENGINE

The search here is entirely in-browser. We just break down the query and perform
a search against a pre-built index.

===========================================================================================

QUERY SYNTAX:

- A peptide can be queried using either one of its identifiers. An identifier is either a peptide's
  DRAMP ID or PEP ID.
    Example #1: PEP1217
    Example #2: DRAMP01472

- Multiple peptides can be queried at once by separating their identifiers using commas.
    Example: DRAMP01472, PEP1217

- A range of peptides can be queried by specifying the its PEP ID followed by the
  starting and ending (inclusive) index separated by a hyphen. Range queries are NOT
  allowed on DRAMP IDs since they are not sequential.
    Example: PEP120-125

- Multiple range queries can be made at a time by separating them with commas.
    Example: PEP120-125

NOTE: Only legal characters in query are the words "DRAMP", "PEP", 0-9, hyphens, commas and spaces.

===========================================================================================

QUERY ALGORITHM:

- Split up the query based on commas.
- Strip whitespace on each query item.
- resultSet = []
- for queryItem in queryItems
	- Check if query item begins with DRAMP or PEP.
    	- Stop processing query item if not.
	- if queryItem starts with DRAMP:
		- if queryItem contains hyphen
			- Stop processing queryItem
		- get PEP ID from selected[1] DRAMP_TO_PEP index
  
  	- add PEP ID to resultSet
- Create cards based on PEP IDs in resultSet


[1]: selected index depends on the page that user is viewing since each page represents a different set of peptides

*/

const search = (query) => {
	const queryItems = query.split(",").map(e => e.trim());

	const resultSet = [];
	const errors = [];
	for (const queryItem of queryItems) {
		if (queryItem === "") continue;

		if (/^DRAMP\d+$/.test(queryItem)) {
			const drampID = queryItem.substring(5);
			if (DRAMP_TO_PEP[drampID] !== undefined) {
				const resultItem = {
					"drampID": drampID,
					"pepID": DRAMP_TO_PEP[drampID],
				}
				resultSet.push(resultItem);
			}
		} else if (queryItem.startsWith("PEP") && queryItem.length > 3) {
			const subQueryItem = queryItem.substring(3);
			const indices = subQueryItem.split("-");

			switch (indices.length) {
				case 1: {
					
					const resultItem = {
						"drampID": PEP_TO_DRAMP[subQueryItem.toString()],
						"pepID": parseInt(subQueryItem),
					};
					resultSet.push(resultItem);
					break;
				}
				case 2: {
					const startIndex = parseInt(indices[0]);
					const endIndex = parseInt(indices[1]);
					
					if (startIndex > endIndex)
						continue;

					for (let i = startIndex; i <= endIndex; i++) {
						const resultItem = {
							"drampID": PEP_TO_DRAMP[i],
							"pepID": i,
						};
						resultSet.push(resultItem);
					}

					break;
				}
				default: {
					// Invalid range query
					errors.push(`Invalid range query: ${queryItem}`);
				}
			}
		} else {
			errors.push(`Invalid query: ${query}`);
		}
	}

	return {
		"resultSet": resultSet,
		"errors": errors
	};
};
