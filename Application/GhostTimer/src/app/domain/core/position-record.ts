import { Injectable } from "@angular/core";

/**
 * A position class that contains the data collected from the geolocation web API.
 * We need to convert to a concrete class so we can serialize and deserialize.
 */
@Injectable({providedIn: 'root'})
export class PositionRecord
{
	/**
	 * As the records are logged the code keeps incrementing the LogID to make relating things easier.
	 */
	public PositionRecordLogID: number;
    public Altitude: number | null;
    public Heading: number | null;
    public Latitude: number;
    public Longitude: number;
	public SpeedKilometersPerHour: number | null;
	public SpeedKnots: number | null;
	public SpeedMetersPerSecond: number | null;
	public SpeedMilesPerHour: number | null;
	public RecordedDateTime: string;
}