import { createFeatureSelector } from "@ngrx/store";
import { adapter, passengersFeatureKey, State } from "./passenger.reducer";

export const selectPassengerState = createFeatureSelector<State>(passengersFeatureKey)

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors(selectPassengerState);
