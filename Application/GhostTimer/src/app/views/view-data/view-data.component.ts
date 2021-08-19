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
			records.forEach((record) =>
			{
				this.PositionRecords.push(record);
			});
		}
	}

	/**
	 * Generates a simple CSV file of the data to download.
	 */
	public GenerateCSVForDownload(): void
	{
		if (this.PositionRecords?.length > 0)
		{
			// Create header row
			let csvContent = `PositionRecordLogID,Altitude,Heading,Latitude,Longitude,SpeedMPH,RecordedDateTime\r\n`;

			this.PositionRecords.forEach((rowArray) =>
			{
				csvContent += `${rowArray.PositionRecordLogID},${rowArray.Altitude},${rowArray.Heading},${rowArray.Latitude},${rowArray.Longitude},${rowArray.SpeedMilesPerHour},${rowArray.RecordedDateTime}\r\n`;
			});

			var hiddenElement = document.createElement('a');
			hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
			hiddenElement.target = '_blank';
			hiddenElement.download = 'ghost_timer_export.csv';
			hiddenElement.click();
		}
		else
		{
			alert("No data collected, yet.");
		}
	}
}
