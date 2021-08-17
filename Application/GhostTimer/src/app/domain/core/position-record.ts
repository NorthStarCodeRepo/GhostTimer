import { Injectable } from "@angular/core";

/**
 * A position class that contains the data collected from the geolocation web API.
 * We need to convert to a concrete class so we can serialize and deserialize.
 */
@Injectable({providedIn: 'root'})
export class PositionRecord
{
    public Altitude: number | null;
    public Heading: number | null;
    public Latitude: number;
    public Longitude: number;
    public Speed: number | null;
}