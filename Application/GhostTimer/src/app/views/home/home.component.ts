import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
	private readonly positionOptions: PositionOptions = {
		enableHighAccuracy: true
	}
	
	public Altitude: any = 0;
	public PageTitle: string = "Sailing";
	public Direction: string = "N/A"
	public Heading: any = "N/A";
	public Latitude: any = 0;
	public Longitude: any = 0;
	public SpeedInKnots: any = 0;
	public SpeedInMPH: any = 0;
	
	public constructor() { }

	public ngOnInit(): void
	{
		this.WatchDevicePosition();
	}

	/**
	 * https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
	 * https://www.w3schools.com/html/html5_geolocation.asp
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
				// https://www.inchcalculator.com/convert/meter-per-second-to-knot/
				this.SpeedInKnots = Math.ceil(Math.floor(position.coords.speed) * 1.943844);
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