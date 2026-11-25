<?php

require_once __DIR__ . '/../config.php';

class MemberRepo
{

	public static function GetAll(): array
	{
		$filePath = Config::MemberDirectoryPath;
		$raw = file_get_contents($filePath);
		$data = json_decode($raw, true);

		return $data;
	}

	public static function Save(array $contents)
	{

		$filePath = Config::MemberDirectoryPath;
		$encoded = json_encode($contents);
		file_put_contents($filePath, $encoded);
	}

	private static function FindMemberIndex(array $members, string $callsign): int
	{
		foreach ($members as $index => $entry) {
			if (isset($entry['callsign']) && strtolower(trim($entry['callsign'])) === $callsign) {
				return $index;
			}
		}
		return -1;
	}

	public static function Upsert(array $memberList)
	{
		$all = MemberRepo::GetAll();
		$responseData = [];

		foreach ($memberList as $upsertEntry) {
			$normalizedCallsign = strtolower(trim($upsertEntry['callsign']));

			$index = self::FindMemberIndex($all, $normalizedCallsign);

			if ($index === -1) {
				$index = count($all);
				$all[$index] = ['callsign' => $upsertEntry['callsign']];
			}

			// Merge reported values, remove duplicates, and sort
			$reported = array_merge(
				$all[$index]['reported'] ?? [],
				$upsertEntry['reported'] ?? []
			);
			$sortedReported = array_values(array_unique($reported));
			sort($sortedReported);

			$lastActive = ($upsertEntry['lastActive'] ?? '') 
				> ($all[$index]['lastActive'] ?? '')
				? $upsertEntry['lastActive'] ?? ''
				: $all[$index]['lastActive'] ?? '';

			// Update member properties
			$all[$index] = array_merge($all[$index], [
				'name'       => $upsertEntry['name'] ?? '',
				'qth'        => $upsertEntry['qth'] ?? '',
				'grid'       => $upsertEntry['grid'] ?? '',
				'reported'   => $sortedReported,
				'lastActive' => $lastActive,
			]);

			array_push($responseData, $all[$index]);
		}

		MemberRepo::Save($all);
		return Response::Json($responseData, 201);
	}
}
