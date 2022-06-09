import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromPassengers from './+state';

@Component({
  selector: 'flight-workspace-passengers',
  templateUrl: './passengers.component.html',
  styleUrls: ['./passengers.component.css'],
})
export class PassengersComponent {
  passengers$ = this.store.select(fromPassengers.selectAll);

  constructor(private store: Store) {
    this.store.dispatch(
      fromPassengers.addPassengers({
        passengers: [
          { id: 1, name: 'Max' },
          { id: 2, name: 'Susi' }
        ]
      })
    );
  }
}
