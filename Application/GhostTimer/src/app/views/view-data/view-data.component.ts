import { Component, OnInit } from '@angular/core';
import { PositionRecord } from 'src/app/domain/core/position-record';
import { LocalStorageService } from 'src/app/domain/system/storage/local-storage.service';

@Component({
	selector: 'app-view-data',
	templateUrl: './view-data.component.html',
	styleUrls: ['./view-data.component.scss']
})
export class ViewDataComponent implements OnInit
{
	private positionRecordStorageName: string = "_position_";

	public PositionRecords: PositionRecord[] = [];

	constructor(private localStorageService: LocalStorageService) { }

	ngOnInit(): void
	{
		let records = this.localStorageService.GetItem<PositionRecord[]>(this.positionRecordStorageName);

		if (records != null)
		{
			this.PositionRecords = records;
		}
	}

}
