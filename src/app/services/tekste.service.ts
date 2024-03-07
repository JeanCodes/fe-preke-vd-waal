import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const baseUrl = 'http://ec2-54-78-171-181.eu-west-1.compute.amazonaws.com:1234/api/tekste';

@Injectable({
  providedIn: 'root'
})
export class TeksteService {
  constructor(private http: HttpClient) { }
  getAll() {
    console.log(`Making call to ${baseUrl}`);
    return this.http.get(baseUrl);
  }

}
