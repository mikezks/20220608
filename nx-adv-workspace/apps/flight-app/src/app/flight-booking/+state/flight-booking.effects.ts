import { Injectable } from '@angular/core';
import { FlightService } from '@flight-workspace/flight-lib';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import * as FlightBookingActions from './flight-booking.actions';




@Injectable()
export class FlightBookingEffects {

  loadFlights$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FlightBookingActions.flightsLoad),
      switchMap(action => this.flightService.find(
        action.from,
        action.to,
        action.urgent
      )),
      map(flights => FlightBookingActions.flightsLoaded({ flights }))
    )
  );

  constructor(
    private actions$: Actions,
    private flightService: FlightService) {}
}
