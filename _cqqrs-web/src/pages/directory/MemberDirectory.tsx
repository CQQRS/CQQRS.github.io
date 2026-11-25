import { useEffect, useState } from "react";

import { MemberEntry } from "@site/src/classes/MemberDirectory";
import { CqqrsApiClient } from "@site/src/classes/ApiClient/CqqrsApiClient";
import { environment } from "@site/environment/environment";
import Avitar from "@site/src/components/Avitar";

interface MemberDirectoryProps {
	photo: File | undefined
}
export default function MemberDirectory({ }: MemberDirectoryProps) {

	interface IGroup {
		title: string,
		value: MemberEntry[]
	}
	interface IGroupList {
		intl: IGroup,
		zl: IGroup,
		vk1: IGroup,
		vk2: IGroup,
		vk3: IGroup,
		vk4: IGroup,
		vk5: IGroup,
		vk6: IGroup,
		vk7: IGroup,
		vk8: IGroup,
		vk9: IGroup,
		vk0: IGroup,
	}

	const [data, setData] = useState<IGroup[]>();

	useEffect(() => {

		let filterDate = new Date();
		filterDate.setFullYear(filterDate.getFullYear() - 1);

		async function start() {
			const api = new CqqrsApiClient();
			let members = await api.members.getAll();

			members.sort((a, b) => a.callsign.localeCompare(b.callsign));
			members = members.filter(v =>
				v.name !== ''
				&& v.lastActive > filterDate);


			const groupList: IGroup[] = [
				{ title: "DX", value: members.filter(v => !v.callsign.match(/^(?:VK|ZL)/)) },
				{ title: "ZL", value: members.filter(v => v.callsign.match(/^ZL/)) }
			];

			for (let cI = 0; cI < 10; cI++) {
				groupList.push({
					title: `VK${cI}`,
					value: members.filter(v => v.callsign.match(new RegExp(`VK${cI}`)))
				});
			}


			setData(groupList);
		}
		start();

	}, []);

	const ulStyle = {
		listStyleType: "none"
	}

	return data && (
		<>
			<div>
				{data.map(group => group.value.length > 0 && (
					<a href={`#${group.title}`}
						key={group.title}
					> {group.title}</a>
				))}
			</div >
			<div>
				{data.map(group => group.value.length > 0 && (
					<div key={group.title} id={group.title}>
						<h2>{group.title}</h2>
						<ul style={ulStyle}>
							{group.value.map(item => (
								<li key={item.callsign}>
									<Avitar callsign={item.callsign}></Avitar>
									<b>{item.callsign}</b> &nbsp;
									{item.name} in {item.qth}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</>
	);
}