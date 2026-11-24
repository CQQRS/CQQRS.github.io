# CQQRS API

**BASE URL:** `https://conryclan.com/projects/cqqrsnet/api`

# Reports

## GET /v1/reports

### Params:
No parameters

### Example Request:
 ```typescript
  fetch(`${baseUrl}/v1/reports`)
	.then(response -> response.json())
	.then(data => console.log(data));
  ```

### Example response:
```json
	[
		{
			"edition": "2026_44"
			"url": "~/reports/2026_44"
		}
	]
```

## GET /reports/{year}/{week}

The reports for the specified edition

### Params:
| Attribute             | Type		| Required	| Default	| Description          	|
|-----------------------|-----------|-----------|-----------|-----------------------|
| `year`              	| number	| Yes		| -			| The year of the requested report	|
| `week`				| number	| Yes		| -			| The week-of-year of the requested report	|



### Example Request:
 ```typescript
  fetch(`${baseUrl}/v1/reports/2026/44`)
	.then(response -> response.json())
	.then(data => console.log(data));
  ```

### Example Response:
```json
	[
		{
			"edition": "2026_44"
			"url": "~/reports/2026_44"
		}
	]
```

### Status Codes:
| Status	| Meaning		|
|-----------|---------------|
| 200		| Success		|
| 306		| Not-Modified	|

**PUT** `~/reports/{edition}/{callsign}`

Creates or replaces an individual report

**GET** `~/reports/{edition}/media`

List of media for the specified edition

## Members

**GET**List all members