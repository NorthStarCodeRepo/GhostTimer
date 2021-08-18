import { Injectable } from '@angular/core';

/**
 * A localStorage API helper class that makes working with the API even easier.
 * Serialization and deserialization is all done within the class itself.
 */
@Injectable({
	providedIn: 'root'
})
export class LocalStorageService
{
	constructor() { }

	/**
	 * Get an item in localStorage. Returns null if nothing exists. Also deserializes to a 
	 * specified type passed along at time of implementation call.
	 * @param storageItemName - The key name of the item to store.
	 * @returns T - The specified type of object when method is called, or null.
	 */
	public GetItem<T>(storageItemName: string): T
	{
		let storageItemValue: T = null;

		let storageItemSerialized = window.localStorage.getItem(storageItemName);
		if (storageItemSerialized != null)
		{
			storageItemValue = <T>JSON.parse(storageItemSerialized);
		}

		return storageItemValue;
	}

	/**
	 * Removes an item from localStorage.
	 * @param storageItemName - The key name of the item to store.
	 */
	public RemoveItem(storageItemName: string): void
	{
		window.localStorage.removeItem(storageItemName);
	}

	/**
	 * Sets an item in localStorage. The method handles serializing your object
	 * so simply pass your raw object with a specified type.
	 * @param storageItemName - The key name of the item to store.
	 * @param storageItemValue - The [object] value of the item to store.
	 */
	public SetItem<T>(storageItemName: string, storageItemValue: T): void
	{
		let storageItemSerialized = JSON.stringify(storageItemValue);
		window.localStorage.setItem(storageItemName, storageItemSerialized);
	}

	/**
	 * Check to see that [type] of storage is available.
	 * @param type - 'localStorage' or 'sessionStorage'
	 * @returns - If the [type] of storage is available.
	 */
	public LocalStorageAvailable(): boolean
	{
		let storageAvailable = false;

		let storage;
		try
		{
			storage = window['localStorage'];
			let x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			storageAvailable = true;
		}
		catch (e)
		{
			storageAvailable = e instanceof DOMException && (
				// everything except Firefox
				e.code === 22 ||
				// Firefox
				e.code === 1014 ||
				// test name field too, because code might not be present
				// everything except Firefox
				e.name === 'QuotaExceededError' ||
				// Firefox
				e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
				// acknowledge QuotaExceededError only if there's something already stored
				(storage && storage.length !== 0);
		}

		return storageAvailable;
	}
}
