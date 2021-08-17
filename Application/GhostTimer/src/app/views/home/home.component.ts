import { Component, OnInit } from '@angular/core';
import { PositionRecord } from 'src/app/domain/core/position-record';

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
	public timerStartDateTime: number;
	private readonly timerInterval = 100; // milliseconds

	/**
	 * At set intervals record the new location data.
	 * Read the data at every X seconds. Super gross way to do this.
	 */
	private readGeolocationDataIntervals: number[] = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

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

	public constructor() { }

	public ngOnInit(): void
	{
		this.WatchDevicePosition();
	}

	/**
	 * Trigger the stopwatch to start running
	 */
	public StartTimerInterval(): void
	{
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

		// Take a data reading every X seconds according to the array values
		if (this.readGeolocationDataIntervals.includes(totalDecimalElapsed))
		{

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
				positionRecord.Altitude = position.coords.altitude;
				positionRecord.Heading = position.coords.heading;
				positionRecord.Latitude = position.coords.latitude;
				positionRecord.Longitude = position.coords.longitude;
				positionRecord.Speed = position.coords.speed;

				console.log(JSON.stringify(positionRecord));

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
}