deep-string-comparison allows you to compare two strings deeply, calculate differences and highlight changes in user-friendly manner, like your git tool does.

Algorithm complexity O(n^2), where n is a string length

```JavaScript
import { comparator } from "deep-string-comparison";
const { aDiff, bDiff } = comparator(
  'my test string HAS data',
  'my COOL string test data'
)
```
Output:

```JSON
[
  { "from":  0, "to":  2, "type": "not_changed", "value": "my "},
  { "from":  3, "to":  6, "type": "moved",     "value": "test" },
  { "from":  7, "to": 14, "type": "not_changed", "value": " string " },
  { "from": 15, "to": 17, "type": "deleted",   "value": "HAS" },
  { "from": 18, "to": 22, "type": "not_changed", "value": " data" }
]

```

what is in plans:
- make a package compatible with 'commonJs' modules
- comparison of multi-line strings
- improve output for short substrings 
- improve performance

your feedback is strongly appreciated

abi83, Dec. 2022
