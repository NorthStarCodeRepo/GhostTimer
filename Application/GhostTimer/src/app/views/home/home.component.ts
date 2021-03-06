import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { PositionRecord } from 'src/app/domain/core/position-record';
import { LocalStorageService } from 'src/app/domain/system/storage/local-storage.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit
{
	private readonly positionOptions: PositionOptions = {
		enableHighAccuracy: true
	}

	/**
	 * At set intervals record the new location data.
	 * Read the data at every X seconds. Super gross way to do this.
	 */
	private readGeolocationDataIntervals: number[] = [0, 10, 20, 30, 40, 50];
	private readonly timerInterval = 100; // milliseconds
	private wakeLock: any = null;
	private positionRecordStorageName: string = "_position_";
	private positionRecordLogID: number = 0;

	public timerStartDateTime: number;
	public Altitude: any = 0;
	public PageTitle: string = "Ghost Timer";
	public Direction: string = "N/A"
	public Heading: any = "N/A";
	public Latitude: any = 0;
	public Longitude: any = 0;
	public SpeedInMPH: any = 0;

	public HundredthSeconds: number = 0;
	public Seconds: number = 0;
	public Minutes: number = 0;
	public Hours: number = 0;

	public CurrentTimer: any;
	public TimerStarted = false;
	public WakeLockClass = "badge badge-pill badge-info";
	public WakeLockMessage = "N/A";
	public PositionRecordSaved: boolean = false;

	public constructor(private localStorageService: LocalStorageService) { }

	public ngOnInit(): void
	{
		this.ConfigureWakeLock();
	}

	/**
	 * Trigger the stopwatch to start running
	 */
	public StartTimerInterval(): void
	{
		this.localStorageService.RemoveItem(this.positionRecordStorageName);
		this.TimerStarted = true;
		// Reset the start time every time the timer is stopped and started
		this.HundredthSeconds = 0;
		this.timerStartDateTime = Date.now(); // This handles seconds
		this.Minutes = 0;
		this.Hours = 0;

		// Set a property equal to an interval so we can clear it later for stopping and starting
		this.CurrentTimer = setInterval(() =>
		{
			this.CalculateStopwatchValues();
		}, this.timerInterval);

		// Log some data as soon as they hit start
		this.GetDevicePosition();
		this.WatchDevicePosition();
	}

	/**
	 * Clears the interval running for the stopwatch.
	 */
	public StopTimerInterval(): void
	{
		this.TimerStarted = false;
		clearInterval(this.CurrentTimer);
	}

	/**
	 * Handles the calculations for the stopwatch intervals. Keeping it accurate with an actual date time and not 
	 * just the setInterval cadence.
	 */
	public CalculateStopwatchValues(): void
	{
		var currentTime = Date.now(); // In milliseconds
		var delta = currentTime - this.timerStartDateTime; // milliseconds elapsed since start

		var totalSecondsElapsed = delta / 1000; // Convert to seconds
		var totalDecimalElapsed = parseFloat((totalSecondsElapsed).toFixed(2));

		// Check the floor value. This is what dictates adding a second
		// If it's a new second then check to see if it's time to log some geo data
		var floorSecondsElapsed = Math.floor(totalSecondsElapsed);
		if (floorSecondsElapsed != this.Seconds
			&& this.readGeolocationDataIntervals.includes(floorSecondsElapsed))
		{
			this.GetDevicePosition();
		}
		this.Seconds = floorSecondsElapsed; // Update it once done

		var hundredthSeconds = parseFloat((totalDecimalElapsed - floorSecondsElapsed).toFixed(2).substring(2));
		this.HundredthSeconds = hundredthSeconds;

		// Add another minute passed and reset seconds to 0
		if (this.Seconds >= 60)
		{
			this.Minutes += 1;
			this.timerStartDateTime = currentTime; // Only reset the start time with minutes
		}

		// Add another hour passed and reset minutes to 0
		if (this.Minutes >= 60)
		{
			this.Hours += 1;
		}
	}

	/**
	* Used to get the device location to be logged and compared against later on.
	* https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
	* https://www.w3schools.com/html/html5_geolocation.asp
	*/
	private GetDevicePosition(): void
	{
		if (window.navigator.geolocation)
		{
			window.navigator.geolocation.getCurrentPosition((position: GeolocationPosition) =>
			{
				var positionRecord = new PositionRecord();
				positionRecord.PositionRecordLogID = this.positionRecordLogID;
				positionRecord.Altitude = position.coords.altitude;
				positionRecord.Heading = position.coords.heading;
				positionRecord.Latitude = position.coords.latitude;
				positionRecord.Longitude = position.coords.longitude;
				positionRecord.SpeedKilometersPerHour = Math.round(position.coords.speed * 3.6);
				positionRecord.SpeedKnots = Math.round(position.coords.speed * 1.943844);
				positionRecord.SpeedMetersPerSecond = position.coords.speed;
				positionRecord.SpeedMilesPerHour = Math.round(position.coords.speed * 2.236936);
				positionRecord.RecordedDateTime = moment().format();
				
				this.SaveLocalPositionRecord(this.positionRecordStorageName, positionRecord);
			}, null, this.positionOptions);
		}
		else
		{
			alert("Location services are unavailable.");
		}
	}

	/**
	 * Watches the active device position. Used for the output of dashboard data for feedback.
	 */
	private WatchDevicePosition(): void
	{
		if (window.navigator.geolocation)
		{
			window.navigator.geolocation.watchPosition((position: GeolocationPosition) =>
			{
				// https://www.metric-conversions.org/length/meters-to-feet.htm
				this.Altitude = Math.ceil(position.coords.altitude * 3.2808);
				this.Latitude = position.coords.latitude;
				this.Longitude = position.coords.longitude;
				this.Heading = Math.ceil(position.coords.heading);
				this.Direction = this.CalculateCompassHeading(this.Heading)

				// https://www.inchcalculator.com/convert/meter-per-second-to-mile-per-hour/
				this.SpeedInMPH = Math.ceil(Math.floor(position.coords.speed) * 2.236936);
			}, null, this.positionOptions);
		}
		else
		{
			alert("Location services are unavailable.");
		}
	}

	/**
	 * https://www7.ncdc.noaa.gov/climvis/help_wind.html
	 * @param heading
	 */
	private CalculateCompassHeading(heading: number): string
	{
		let compassDirection = "N/A";

		if (heading >= 349 || heading <= 11)
		{
			compassDirection = `N`
		}
		else if (heading >= 12 && heading <= 78)
		{
			compassDirection = `NE`
		}
		else if (heading >= 79 && heading <= 101)
		{
			compassDirection = `E`
		}
		else if (heading >= 102 && heading <= 168)
		{
			compassDirection = `SE`
		}
		else if (heading >= 169 && heading <= 191)
		{
			compassDirection = `S`
		}
		else if (heading >= 192 && heading <= 258)
		{
			compassDirection = `SW`
		}
		else if (heading >= 259 && heading <= 281)
		{
			compassDirection = `W`
		}
		else if (heading >= 282 && heading <= 348)
		{
			compassDirection = `NW`
		}

		return compassDirection;
	}

	/**
	 * Configure the Wake Lock feature to keep the screen awake all the time.
	 * https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
	 */
	private async ConfigureWakeLock(): Promise<void>
	{
		if ('wakeLock' in navigator)
		{
			try
			{
				//@ts-ignore - wakeLock does not exist on type navigator. Yes it does. It's new.
				this.wakeLock = await navigator.wakeLock.request('screen');
				this.WakeLockClass = "badge badge-pill badge-success";
				this.WakeLockMessage = "Wake Lock Active";
			}
			catch (err)
			{
				this.WakeLockClass = "badge badge-pill badge-danger";
				this.WakeLockMessage = err.message;
			}
		} else
		{
			this.WakeLockClass = "badge badge-pill badge-warning";
			this.WakeLockMessage = "Wake Lock Not Supported";
		}
	}

	/**
	 * Saves or updates the localStorage object for the PositionsRecords.
	 * @param storageItemName - The key for the save item.
	 * @param positionRecord - The value for the position record.
	 */
	public SaveLocalPositionRecord(storageItemName: string, positionRecord: PositionRecord): void
	{
		// Increment the current log ID
		this.positionRecordLogID += 1;
		let positionRecords = this.localStorageService.GetItem<PositionRecord[]>(storageItemName);

		// If the storage item already exists let's unpack it and then update it
		if (positionRecords != null)
		{
			positionRecords.push(positionRecord);
			this.localStorageService.SetItem(storageItemName, positionRecords);
		}
		else
		{
			// Create a new array of position records to be set as the localStorage value
			let positionRecordsLocalStore: PositionRecord[] = [];
			positionRecordsLocalStore.push(positionRecord);

			this.localStorageService.SetItem(storageItemName, positionRecordsLocalStore);
		}

		// Do a quick update for the UI to show that a record was just logged
		this.PositionRecordSaved = true;
		setTimeout(() =>
		{
			this.PositionRecordSaved = false;
		}, 1000);
	}
}